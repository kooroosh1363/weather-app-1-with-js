var cityInput = document.getElementById("cityInput");
var addInput = document.getElementById("add");
var cityOutPut = document.getElementById("cityoutput");
var descOutPut = document.getElementById("description");
var tempOutPut = document.getElementById("temperature");
var windOutPut = document.getElementById("wind");

const apiKey = "bcc9d715a88df781d66d51a02062e0d2";


async function GetWeather(){
    var weatherResult = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput.value}&appid=${apiKey}`)).json();

    
    console.log(weatherResult);

}




addInput.addEventListener('click', GetWeather);
