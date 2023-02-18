const apiKey = '&APPID=365d89ed8b1f3231f3f36c6c09d489d6';
const weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";

let resultsBox = $('#results');


async function sendRequest(event) {
    event.preventDefault();
    let searchRequest = $('#query').val();
    let encodeSearch = encodeURI(searchRequest).trim();
    let weatherQuery = weatherURL + encodeSearch + apiKey;
    return fetch(weatherQuery, { method: 'GET' })
    .then(function(response) {
        return response.json();
    })
    .then (function(data) {
        console.log(data);
        let fahrenheit = Math.round((data.main.temp - 273.15) * (9/5) + 32);
        resultsBox.append(`
        <div class="columns is one-fifth">
            <div class="card">
                <div class="card-header">
                <p class="card-header-title">${data.name}</p>
                </div>
                <div class="card-content">
                <p></p>
                </div>
                <div class="card-footer">
                <p class="card-footer-item">${fahrenheit}°</p>
                <p class="card-footer-item">Wind: ${data.wind.speed} MPH</p>
                <p class="card-footer-item">Humidity: ${data.main.humidity}%</p>
                </div>
            </div>
        </div>
        `)
    });
}

$('#search').submit(sendRequest);
