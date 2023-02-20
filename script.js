// API Key and query URLs

const apiKey = '&APPID=365d89ed8b1f3231f3f36c6c09d489d6';
const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";

// jQuery grab boxes to append to - noted in html

let resultsBox = $('#results');
let historyBox = $('#history');

var searchHistory = [];

// function to be used in sendRequest as well as on page load

function prependHistory() {
    for (let i=0; i < searchHistory.length; i++ ) {
        // prepend adds to top
    historyBox.prepend(`
        <tr><td><a class="clicker" id="${searchHistory[i]}">${searchHistory[i]}</a></tr></tr>
    `);
    };
};

// core async function for sending request, appending results

async function sendRequest(event) {
    event.preventDefault();
    resultsBox.empty();
    let searchRequest = $('#query').val();
    let encodeSearch = encodeURI(searchRequest).trim();
    let weatherQuery = weatherURL + encodeSearch + apiKey;
    let forecastQuery = forecastURL + encodeSearch + apiKey;

    // using Promise.all to send multiple API requests 

    return Promise.all([
        fetch(weatherQuery, { method: 'GET' }).then((response) => {
            if (response.ok) {
                return response.json();
            } else { throw new Error('Search was not a valid city name. Try again!')}}), // throw correctly prevents rest of function from executing if response is not OK
        fetch(forecastQuery, { method: 'GET' }).then((response) => {
            if (response.ok) {
                return response.json();
            } else { throw new Error('Search was not a valid city name. Try again!') }})
    ])
    .then (function(data) {
        if (!searchHistory.includes(searchRequest)) {   // push only unique values to array
            historyBox.empty(); // empty box then loop through array
            searchHistory.push(searchRequest);
            if (searchHistory.length > 10) {
                searchHistory.shift(); // limits searchHistory to 10 items - shifts first answer out of array after tenth search. mostly an aesthetic choice
            }
            prependHistory();
            localStorage.setItem('history', JSON.stringify(searchHistory)); // stores array in localStorage
        };


        let offset = new Date().getTimezoneOffset() * 60000; // getTimezoneOffset is in minutes, so * 60000 for ms
        var offsetCalc = data[0].timezone * 1000 + offset;  // .timezone is in seconds, so * 1000 for ms
        let date1 = new Date(data[0].dt * 1000 + offsetCalc); // this calc converts .dt to the appropriate local time.
        let fahrenheit1 = Math.round((data[0].main.temp - 273.15) * (9/5) + 32); // main.temp is in kelvin, this converts to F

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
            fahrenheits.push(Math.round((data[1].list[i].main.temp - 273.15) * (9/5) + 32)); // pushes to a new array of temps for simplification
        }

        let dates = [];
        let weekdays = [];
        for (let i=0; i < days.length; i++ ) {
            dates.push(new Date(days[i].dt * 1000 + offsetCalc)); // pushes to new array of dates for simplification
            weekdays.push(dates[i].toLocaleDateString('en-US', {weekday: 'long'})); // pushes to new array of weekdays for simplification
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
        // this appends an error notifcation directly in the html rather than alerting via browser. uses bulma notifation class - looks nice.
        resultsBox.append(`
            <div class="column is-full">
            <div class="notification is-primary">
                <button class="delete"></button>
            ${error}
            </div></div>`)
        return;
      });
};

// handles sending request via search form
$('#search').submit(sendRequest);


// $(document).ready function loads history from localStorage and holds click listeners for the history box, on document load

$(document).ready(function() {

    if (localStorage.getItem('history') !== null) {
        searchHistory = JSON.parse(localStorage.getItem('history')); // parses stringified stored data back into an array
        prependHistory();
    } else {
        searchHistory = ['Richmond']; // if there is no search history, this will append one item - 'Richmond' is an easter egg for the University of Richmond coding bootcamp :)
        prependHistory();
    }
    historyBox.on( 'click', '.clicker', function (event) { // .click vs .on was pulling the $(this) of the wrapper rather than the link clicked. appending the clicker class and '.clicker' parameter to the .on method fixed this issue
        $('#query').val($(this).attr('id'));
        sendRequest(event);
    });
});
