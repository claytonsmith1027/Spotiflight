import { run, auth } from "./script.js";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const LINK = "https://flight-engine-h6md.onrender.com";
const number = document.getElementById("flight_num");
const main = document.getElementById("section");
const form = document.getElementById("form");
const date = document.getElementById("date");
const flight = document.getElementById("flight");
const land = document.getElementById("landscape");
if(form === null){
    console.log("Form is null")
}

if (!code) { // checked everytime the site opens (checks if spotify is linked)
    auth();
}


//get_flight("5029", "2025-01-22");


async function get_flight(num, date1) {
    console.log("Trying to get flight data in get_flight");
    const search_string = `${LINK}/flights?date=${date1}&flightNumber=${num}`;
    console.log(search_string);
    console.log("Flight num: ", num);
    console.log("Date: ", date1);

    try {
        const response = await fetch(search_string);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();

        if (!json || json.length === 0) {
            throw new Error("No flight data received");
        }

        const flight = json[0];
        if (!flight.duration || !flight.duration.locale || !flight.destination || !flight.destination.city) {
            throw new Error("Flight data is incomplete");
        }
        var temp = flight.duration.locale;
        const time = convert_time(flight.duration.locale);
        console.log("Converted time:", time);

        await run(time, `Flight to ${flight.destination.city}`); // CALLING TO CREATE THE PLAYLIST
        console.log("Finished run"); // FINSIHED MAKING THE PLAYLIST (ON THE ACCOUNT)
        // Everything after this will run after time wise
        // Stuff here to tell user that its done :)
        displaySpotify(temp, `Flight to ${flight.destination.city}`);


    } catch (error) {
        console.log("Failed to get flight:", error.message);
    }
}


function displaySpotify(temp, dest){
    console.log("User message dispalayed")
    land.innerText = "Check your spotifiy your " + dest+ " playlist for " + temp+ " is ready!"
    
}








function convert_time(time){
    var parStirng = time.split(" ");
    var hour = parStirng[0].split("h");
    var minute = parStirng[1].split("m");
    var hr = parseInt(hour[0],10);
    var mn = parseInt(minute[0], 10)
    var new_time = hr * 60 * 60000 + mn *60000
    return new_time;
}


function displayFlights(json){
    var i  = 0;
    var str = "";
    //console.log(json)
    while(i < json.length){
        console.log("in displayFlights")
        str += "<form>"
        str += "<p>"
        str += "leaving from: \n"
        str += json[i].origin.city
        str += " arriving at \n"
        str += json[i].destination.city
        str += "</p>"
        str += '<input type = "checkbox" id = "'+i.toString()+'" > '
        
        i++
    }
    str+='<input type = "submit">'
    str += "</form>"
    console.log(str)
     
    flight.innerHTML = str;
     flight.addEventListener("submit", (e) =>{
        e.preventDefault();
        console.log("got here! 2");
      
        return find_element(i);
        } );
     
        displayFlights(json);



    }




    function find_element(i){
        var count = 0;
        
            
            get_out = false;
            while(count < i){
                var temp = document.getElementById(count.toString());
                console.log(temp.value )
                if(temp.value !== "on"){
                    flight.innerHTML = "";
                    return count;
                }
                count++;


            }


    }






    form.addEventListener("submit", (e) =>{
    e.preventDefault();
    console.log("Submitted");
  
    const searchNum = number.value;
    const serchDate = date.value
  
    if(searchNum && serchDate){
        get_flight(searchNum, serchDate);
      number.value = "";
      date.value = "";
    }
  });
  
