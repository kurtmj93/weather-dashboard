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
    let forecastQuery = forecastURL + encodeSearch + apiKey;
    return Promise.all([
        fetch(weatherQuery, { method: 'GET' }).then(response => response.json()),
        fetch(forecastQuery, { method: 'GET' }).then(response => response.json())
    ])
    .then (function(data) {
        let offset = new Date().getTimezoneOffset() * 60000;
        let offsetCalc = data[0].timezone * 1000 + offset; 
        let date = new Date(data[0].dt * 1000 + offsetCalc);
        let fahrenheit = Math.round((data[0].main.temp - 273.15) * (9/5) + 32);
        resultsBox.append(`
        <div class="box">
            <div class="card">
                <div class="card-header is-primary">
                <p class="card-header-title">${data[0].name}</p>
                </div>
                <div class="card-content">
                <ul>
                <li>${date.toLocaleDateString()}</li>
                <li>${date.toLocaleTimeString()}</li>
                <li>Temp: ${fahrenheit}°</li>
                <li>Wind: ${data[0].wind.speed} MPH</li>
                <li>Humidity: ${data[0].main.humidity}%</li>
                </ul>
                </div>
            </div>
        </div>
        `)
    });
}

$('#search').submit(sendRequest);
