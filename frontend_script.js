const LINK = "https://flight-engine-h6md.onrender.com";
const number = document.getElementById("flight_num");
const main = document.getElementById("section");
const form = document.getElementById("form");
const date = document.getElementById("date");
const date_text = document.getElementById("date_text");
if(number.value != null){
    console.log("yes")
}


get_flight("5029", "2025-01-22");





function get_flight(num, date1){

    var search_string = LINK + "/flights?date="+date1+"&flightNumber=" + num;
    var time;
    console.log(search_string);
    try{
    fetch(search_string)
        .then((response) => response.json())
        .then((json) =>{ 
            time = json[0].duration.locale;
            console.log(time)
            time = convert_time(time)
            console.log(time)
        }
    
    
    
    );
    }
    catch{
        console.log("error");
    }

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


function desplay_flights(json){




}