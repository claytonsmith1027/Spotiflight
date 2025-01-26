import script1 from "script.js"

const LINK = "https://flight-engine-h6md.onrender.com";
const number = document.getElementById("flight_num");
const main = document.getElementById("section");
const form = document.getElementById("form");
const date = document.getElementById("date");
const flight = document.getElementById("flight");
const spotify = document.getElementsByClassName("spotify");
if(form === null){
    console.log("dang")
}


//get_flight("5029", "2025-01-22");





function get_flight(num, date1){

    var search_string = LINK + "/flights?date="+date1+"&flightNumber=" + num;
    var time;
    console.log(search_string);
    try{
    fetch(search_string)
        .then((response) => response.json())
        .then((json) =>{ 
            //var count = desplay_flights(json);
            time = json[0].duration.locale;
            console.log(time)
            time = convert_time(time)
            console.log(time)
            script1.run(time, "flight to " + json[0].destination.city )
            
        }
    
    
    
    );
    }
    catch{
        console.log("error");
    }


}
function desplay_spotify(){
    spotify.innerHTML = ` 
            <p>
                Downloaded!
                Check your spotify!
            </p>
    
    
    
    `



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
    var i  = 0;
    var str = ""
    //console.log(json)
    while(i < json.length){
        console.log("in desplay_flights")
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
        console.log("got here! 2")
      
        return find_element(i);
        } );
     
        desplay_flights(json);



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
    console.log("got here!")
  
    const searchNum = number.value;
    const serchDate = date.value
  
    if(searchNum && serchDate){
        get_flight(searchNum, serchDate);
      number.value = "";
      date.value = "";
    }
  });
  
