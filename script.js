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
        console.log(data);
        let offset = new Date().getTimezoneOffset() * 60000;
        var offsetCalc = data[0].timezone * 1000 + offset; 
        let date1 = new Date(data[0].dt * 1000 + offsetCalc);
        let fahrenheit1 = Math.round((data[0].main.temp - 273.15) * (9/5) + 32);

        resultsBox.append(`
        <div class="column is-full">
            <div class="box">
                <h2 class="title">${data[0].name}</h2>
                <p class="subtitle">Current</p>
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
            console.log(days); // for testing
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
        
});
};


$('#search').submit(sendRequest);
