var cityInput = document.getElementById("cityInput");
var addInput = document.getElementById("add");
var cityOutPut = document.getElementById("cityoutput");
var descOutPut = document.getElementById("description");
var tempOutPut = document.getElementById("temperature");
var windOutPut = document.getElementById("wind");

const apiKey = "bcc9d715a88df781d66d51a02062e0d2";

function convertToCel(value){
    return (value-273).toFixed(2);
}

async function GetWeather() {
  var weatherResult = await (
    await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityInput.value}&appid=${apiKey}`
    )
  ).json();

  setInfo(weatherResult)
}

function setInfo(data) {
  var cityName = data["name"];
  var description = data["weather"][0]["description"];
  var temp = data["main"]["temp"];
  var wind = data["wind"]["speed"];

  cityOutPut.innerHTML= `City : ${cityName}`;
  descOutPut.innerHTML= `Description : ${description}`;
  tempOutPut.innerHTML= `Temperature : ${convertToCel(temp)}`;
  windOutPut.innerHTML= `Wind Speed : ${wind}`; 
}

addInput.addEventListener("click", GetWeather);
