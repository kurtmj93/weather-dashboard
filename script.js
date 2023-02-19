const apiKey = '&APPID=365d89ed8b1f3231f3f36c6c09d489d6';
const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";

let resultsBox = $('#results');


async function sendRequest(event) {
    event.preventDefault();
    resultsBox.empty();
    let searchRequest = $('#query').val();
    let encodeSearch = encodeURI(searchRequest).trim();
    let weatherQuery = weatherURL + encodeSearch + apiKey;
    return fetch(weatherQuery, { method: 'GET' })
    .then(function(response) {
        return response.json();
    })
    .then (function(data) {
        let offset = new Date().getTimezoneOffset() * 60000;
        let offsetCalc = data.timezone * 1000 + offset; 
        let date = new Date(data.dt * 1000 + offsetCalc);
        let fahrenheit = Math.round((data.main.temp - 273.15) * (9/5) + 32);
        resultsBox.append(`
        <div class="columns is one-fifth">
            <div class="card">
                <div class="card-header">
                <p class="card-header-title">${data.name}</p>
                </div>
                <div class="card-content">
                <ul>
                <li>${date.toLocaleDateString()}</li>
                <li>${date.toLocaleTimeString()}</li>
                <li>Temp: ${fahrenheit}°</li>
                <li>Wind: ${data.wind.speed} MPH</li>
                <li>Humidity: ${data.main.humidity}%</li>
                </ul>
                </div>
                <div class="card-footer">
                </div>
            </div>
        </div>
        `)
    });
}

$('#search').submit(sendRequest);
