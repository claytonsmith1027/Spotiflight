const clientId = "9b013a625b9146819303c44cc32d0615"; // Replace with your client ID
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    //populateUI(profile);
    try{
        // const topSongs = await getTopSongs(accessToken, 1);
        // console.log("Got top songs:", topSongs);
        
        // const newReleaseResults = await getNewAlbums(20,0,accessToken);
        // console.log("Got new release results", newReleaseResults);
        // for (const album of newReleaseResults.albums.items){
        //     console.log(album.name);
        //     const songsInAlbum = await getSongsFromAlbum(album, accessToken);
        //     console.log(songsInAlbum);
        // }

        const playlist = await createPlaylist("Test1", profile, accessToken); // Creates an empty playlist
        const formattedSongArray = await createSongListFromTime(12000000, accessToken); // Creates an array of formatted strings with songs adding to given time
        const addSongResult = await addSongs(playlist, formattedSongArray, accessToken); // adds songs to playlist
        
    }
    catch (error) {
        console.error("Failed main program: ", error);
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

// function populateUI(profile) {
//     document.getElementById("displayName").innerText = profile.display_name;
//     if (profile.images[0]) {
//         const profileImage = new Image(200, 200);
//         profileImage.src = profile.images[0].url;
//         document.getElementById("avatar").appendChild(profileImage);
//         document.getElementById("imgUrl").innerText = profile.images[0].url;
//     }
//     document.getElementById("id").innerText = profile.id;
//     document.getElementById("email").innerText = profile.email;
//     document.getElementById("uri").innerText = profile.uri;
//     document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
//     document.getElementById("url").innerText = profile.href;
//     document.getElementById("url").setAttribute("href", profile.href);
// }

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


async function getNewAlbums(limit, offset, token){
    try{
        const newResultsAlbums = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=${limit}&offset=${offset}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });

          if (!newResultsAlbums.ok){
            throw new Error(`HTTP error status : ${newResultsAlbums.status}`);
          }

          const newReleases = await newResultsAlbums.json();
          return newReleases;
    }catch (error){
        console.log("error getting new releases albums", error);
    }
}

async function getSongsFromAlbum(album, token){
    try{
        const songResults = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });

          if (!songResults.ok){
            throw new Error(`HTTP error status : ${songResults.status}`);
          }

          const songs = await songResults.json();
          return songs;
    }catch (error){
        console.log("error getting songs from album", error);
    }
}

function random(min, max){
    return Math.ceil(Math.random() * (max - min) + min);
}

function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function createSongListFromTime(timeGoal, token){
    var addedTracks = [];
    var time = 0;
    var releaseOffest = 0 + random(0,10);
    const requestAlmbumCount = 20;
    const albumSongLimit = 4;

    while (time <= timeGoal){
        const albums = await getNewAlbums(requestAlmbumCount, releaseOffest, token);
        for (const album of albums.albums.items){
            const tracks = await getSongsFromAlbum(album, token);
            var albumSongCount = 0;
            for (const track of tracks.items){
                if (time > timeGoal){break;}
                if (albumSongCount == albumSongLimit){break;}
                addedTracks.push(formatSongString(track.id));
                time += track.duration_ms;
                albumSongCount += 1;
            }
            if (time > timeGoal){break;}
        }
        releaseOffest += requestAlmbumCount + random(0,5);
    }
    const shuffled = fisherYatesShuffle(addedTracks)
    return shuffled;
}

