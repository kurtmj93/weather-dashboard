const weatherKey = '365d89ed8b1f3231f3f36c6c09d489d6';
let city;
city = 'London,uk';
let queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + weatherKey;
console.log(fetch(queryURL));