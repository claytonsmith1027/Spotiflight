const clientId = "9b013a625b9146819303c44cc32d0615"; // Replace with your client ID
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    populateUI(profile);
    try{
        const topSongs = await getTopSongs(accessToken, 5);
        console.log("Got top songs:", topSongs);
        const playlist = await createPlaylist("Test1", profile, accessToken);
        const formattedSongArray = createSongListFromTime(6000000, topSongs.items);
        const addSongResult = await addSongs(playlist, formattedSongArray, accessToken);
    }
    catch (error) {
        console.error("Failed to get top songs:", error);
    }
    // try{
    //     const newPlaylist = await createPlaylist("TEST", profile, accessToken);
    //     console.log("Created playlist:", newPlaylist);
    // }
    // catch (error) {
    //     console.error("Failed to create playlist:", error);
    // }
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });
    return await result.json();
}

function populateUI(profile) {
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
}

async function createPlaylist(playListName, profile, token) {
    try {
      const playlistResult = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: playListName,
          public: false // Set to true if you want the playlist to be public
        })
      });
  
      if (!playlistResult.ok) {
        throw new Error(`HTTP error! status: ${playlistResult.status}`);
      }
  
      const playlist = await playlistResult.json();
      console.log(playlist);
      return playlist;
    } catch (error) {
      console.error("Error creating playlist:", error);
      throw error;
    }
  }

  function formatSongString(trackId){
    return "spotify:track:" + trackId;
  }

  async function addSongs(playlist, formattedSongsArray, token){
    try {
        console.log(formattedSongsArray);
        console.log("Trying to add songs");
        console.log("playlist id: " + playlist.id);
        console.log(formattedSongsArray.join(','));
        if(formattedSongsArray.length == 0){
            throw new Error('No songs');
        }
        const addResult = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            uris: formattedSongsArray
          })
        });
    
        if (!addResult.ok) {
          throw new Error(`HTTP error! status: ${addResult.status}`);
        }
    
        const addResultJson = await addResult.json();
        return addResultJson;
      } catch (error) {
        console.error("Error adding songs to playlist:", error);
        throw error;
      }
}
  
  async function getTopSongs(token, count) {
    try {
      const songsResults = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${count}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!songsResults.ok) {
        throw new Error(`HTTP error! status: ${songsResults.status}`);
      }
  
      const topSongs = await songsResults.json();
      return topSongs;
    } catch (error) {
      console.error("Error getting top songs:", error);
      throw error;
    }
  }

async function getRecommendations(topFiveJson){
    var seedArray = [];
    for (track in topFiveJson){
        seedArray.push(track.id);
    }
    try{
        const recResults = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${seedArray.join(',')}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });
    } catch (error){
        console.error("Error getting recommendations", error);
        throw error;
    }
    
}

function createSongListFromTime(timeGoal, tracks){
    var addedTracks = [];
    var time = 0;

    for (const track of tracks) {
        addedTracks.push(formatSongString(track.id));
        time += track.duration_ms;
        if (time > timeGoal){break;}
    }

    addedTracks.concat(addedTracks);
    return addedTracks;
}

