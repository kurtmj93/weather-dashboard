const apiKey = '&APPID=365d89ed8b1f3231f3f36c6c09d489d6';
const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";

let resultsBox = $('#results');
let historyBox = $('#history');

var searchHistory = [];

async function sendRequest(event) {
    event.preventDefault();
    resultsBox.empty();
    let searchRequest = $('#query').val();
    let encodeSearch = encodeURI(searchRequest).trim();
    let weatherQuery = weatherURL + encodeSearch + apiKey;
    let forecastQuery = forecastURL + encodeSearch + apiKey;
    return Promise.all([
        fetch(weatherQuery, { method: 'GET' }).then((response) => {
            if (response.ok) {
                return response.json();
            } else { throw new Error('Search was not a valid city name. Try again!')}}),
        fetch(forecastQuery, { method: 'GET' }).then((response) => {
            if (response.ok) {
                return response.json();
            } else { throw new Error('Search was not a valid city name. Try again!') }})
    ])
    .then (function(data) {
        if (!searchHistory.includes(searchRequest)) {   // push only unique values to array
            historyBox.empty();
            searchHistory.push(searchRequest);
            if (searchHistory.length > 10) {
                searchHistory.shift(); // limits searchHistory to 10 items - shifts first answer out of array after tenth search
            }
            for (let i=0; i < searchHistory.length; i++ ) {

                // prepend adds to top
            historyBox.prepend(`
                <tr><td><a id="${searchHistory[i]}">${searchHistory[i]}</a></tr></tr>
            `);
            };
            localStorage.setItem('history', JSON.stringify(searchHistory));
        };


        let offset = new Date().getTimezoneOffset() * 60000;
        var offsetCalc = data[0].timezone * 1000 + offset; 
        let date1 = new Date(data[0].dt * 1000 + offsetCalc);
        let fahrenheit1 = Math.round((data[0].main.temp - 273.15) * (9/5) + 32);

        resultsBox.append(`
        <div class="column is-full">
            <div class="box">
                <h2 class="title">${data[0].name}</h2>
                <p class="subtitle">Current Conditions</p>
                <img src="http://openweathermap.org/img/w/${data[0].weather[0].icon}.png" alt="${data[0].weather[0].main}">
                <ul>
                    <li>${date1.toLocaleDateString()}</li>
                    <li>${date1.toLocaleTimeString()}</li>
                    <li>Temp: ${fahrenheit1}°</li>
                    <li>Wind: ${data[0].wind.speed} MPH</li>
                    <li>Humidity: ${data[0].main.humidity}%</li>
                </ul>
            </div>
        </div>
        `);

        let fahrenheits = [];
        let days = [];
        for (let i=0; i < data[1].list.length; i+=8) { // actual daily forecast is a pro feature - so this i+=8 iteration pulls one data point from each day
            days.push(data[1].list[i]); // pushes to a new array of the days for simplification
            fahrenheits.push(Math.round((data[1].list[i].main.temp - 273.15) * (9/5) + 32)); 
        }

        let dates = [];
        let weekdays = [];
        for (let i=0; i < days.length; i++ ) {
            dates.push(new Date(days[i].dt * 1000 + offsetCalc));
            weekdays.push(dates[i].toLocaleDateString('en-US', {weekday: 'long'}));
        };

        for (let i=0; i < dates.length; i++ ) {
            resultsBox.append(`
                <div class="column is-one-fifth">
                    <div class="box">
                        <p class="subtitle">${weekdays[i]}</p>
                        <img src="http://openweathermap.org/img/w/${days[i].weather[0].icon}.png" alt="${days[i].weather[0].main}">
                        <div class="content">
                            <table>
                            <tr><td>${dates[i].toLocaleDateString()}</td></tr>
                            <tr><td>Temp: ${fahrenheits[i]}°</td></tr>
                            <tr><td>Wind: ${days[i].wind.speed} MPH</td></tr>
                            <tr><td>Humidity: ${days[i].main.humidity}%</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            `);
        };
        
    })       
    .catch(function(error){
        resultsBox.append(`
            <div class="column is-full">
            <div class="notification is-primary">
                <button class="delete"></button>
            ${error}
            </div></div>`)
        return;
      });
};


$('#search').submit(sendRequest);

$(document).ready(function() {
    historyBox.click( function (event) {
        console.log($(this).attr('id'));
        $('#query').val();
    });
});