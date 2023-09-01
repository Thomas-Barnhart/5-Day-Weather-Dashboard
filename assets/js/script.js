// Global Variables
var openWeatherApiKey = '26ba3a7e283acb9cd1e8665c6c3b319a';
var openWeatherCoordinatesUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
var oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='
var userFormEL = $('#city-search');
var col2El = $('.col2');
var cityInputEl = $('#city');
var fiveDayEl = $('#five-day');
var searchHistoryEl = $('#search-history');
var currentDay = moment().format('M/DD/YYYY');
const weatherIconUrl = 'http://openweathermap.org/img/wn/';
var searchHistoryArray = loadSearchHistory();

// Define function to capitalize the first letter of a string and return the joined string
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

// Load cities from local storage and recreate history buttons
function loadSearchHistory() {
    var searchHistoryArray = JSON.parse(localStorage.getItem('search history'));
    if (!searchHistoryArray) {
        searchHistoryArray = {
            searchedCity: [],
        };
    } else {
        for (var i = 0; i < searchHistoryArray.searchedCity.length; i++) {
            searchHistory(searchHistoryArray.searchedCity[i]); // Add search history buttons to page
        }
    }
    return searchHistoryArray;
}

// Saves to the local storage
function saveSearchHistory() {
    localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

// Funciton to create history buttons and append the search history
function searchHistory(city) {
    var searchHistoryBtn = $('<button>')
        .addClass('btn')
        .text(city)
        .on('click', function () {
            $('#current-weather').remove();
            $('#five-day').empty();
            $('#five-day-header').remove();
            getWeather(city);
        })
        .attr({
            type: 'button'
        });
    searchHistoryEl.append(searchHistoryBtn);
}

// Function to get weather data from apiUrl
function getWeather(city) {
    var apiCoordinatesUrl = openWeatherCoordinatesUrl + city + '&appid=' + openWeatherApiKey;
    fetch(apiCoordinatesUrl)
        .then(function (coordinateResponse) {
            if (coordinateResponse.ok) {
                coordinateResponse.json().then(function (data) {
                    var cityLatitude = data.coord.lat;
                    var cityLongitude = data.coord.lon;
                    // Fetch weather information
                    var apiOneCallUrl = oneCallUrl + cityLatitude + '&lon=' + cityLongitude + '&appid=' + openWeatherApiKey + '&units=imperial';
                    fetch(apiOneCallUrl)
                        .then(function (weatherResponse) {
                            if (weatherResponse.ok) {
                                weatherResponse.json().then(function (weatherData) {
                                    // ** Current Day Box ** //
                                    var currentWeatherEl = $('<div>')
                                        .attr({
                                            id: 'current-weather'
                                        })
                                    // Get weather icon
                                    var weatherIcon = weatherData.current.weather[0].icon;
                                    var cityCurrentWeatherIcon = weatherIconUrl + weatherIcon + '.png';
                                    var currentWeatherHeadingEl = $('<h2>')
                                        .text(city + ' (' + currentDay + ')');
                                    //  Image Element
                                    var iconImgEl = $('<img>')
                                        .attr({
                                            id: 'current-weather-icon',
                                            src: cityCurrentWeatherIcon,
                                            alt: 'Weather Icon'
                                        })
                                    //  Current weather details
                                    var currWeatherListEl = $('<ul>')
                                    var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
                                    for (var i = 0; i < currWeatherDetails.length; i++) {
                                        // Runs conditional to assign background color to UV index depending how high it is
                                        if (currWeatherDetails[i] === 'UV Index: ' + weatherData.current.uvi) {
                                            var currWeatherListItem = $('<li>')
                                                .text('UV Index: ')
                                            currWeatherListEl.append(currWeatherListItem);
                                            var uviItem = $('<span>')
                                                .text(weatherData.current.uvi);
                                            if (uviItem.text() <= 2) {
                                                uviItem.addClass('favorable');
                                            } else if (uviItem.text() > 2 && uviItem.text() <= 7) {
                                                uviItem.addClass('moderate');
                                            } else {
                                                uviItem.addClass('severe');
                                            }
                                            currWeatherListItem.append(uviItem);
                                        } else {
                                            var currWeatherListItem = $('<li>')
                                                .text(currWeatherDetails[i])
                                            currWeatherListEl.append(currWeatherListItem);
                                        }
                                    }
                                    $('#five-day').before(currentWeatherEl);
                                    currentWeatherEl.append(currentWeatherHeadingEl);
                                    currentWeatherHeadingEl.append(iconImgEl);
                                    currentWeatherEl.append(currWeatherListEl);
                                    // ** Start of the 5-Day Forecast Box ** //
                                    var fiveDayHeaderEl = $('<h2>')
                                        .text('5-Day Forecast:')
                                        .attr({
                                            id: 'five-day-header'
                                        })
                                    $('#current-weather').after(fiveDayHeaderEl)
                                    var fiveDayArray = [];
                                    for (var i = 0; i < 5; i++) {
                                        let forecastDate = moment().add(i + 1, 'days').format('M/DD/YYYY');
                                        fiveDayArray.push(forecastDate);
                                    }
                                    for (var i = 0; i < fiveDayArray.length; i++) {
                                        var cardDivEl = $('<div>')
                                            .addClass('col3');
                                        var cardBodyDivEl = $('<div>')
                                            .addClass('card-body');
                                        var cardTitleEl = $('<h3>')
                                            .addClass('card-title')
                                            .text(fiveDayArray[i]);
                                        // Weather icon
                                        var forecastIcon = weatherData.daily[i].weather[0].icon;
                                        var forecastIconEl = $('<img>')
                                            .attr({
                                                src: weatherIconUrl + forecastIcon + '.png',
                                                alt: 'Weather Icon'
                                            });
                                        // Creates the card with the weather details on it
                                        var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
                                        // Temputure for the area
                                        var tempEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Temp: ' + weatherData.daily[i].temp.max)
                                        // Wind for the area
                                        var windEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Wind: ' + weatherData.daily[i].wind_speed + ' MPH')
                                        // Humidity for the area
                                        var humidityEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Humidity: ' + weatherData.daily[i].humidity + '%')
                                        fiveDayEl.append(cardDivEl);
                                        cardDivEl.append(cardBodyDivEl);
                                        cardBodyDivEl.append(cardTitleEl);
                                        cardBodyDivEl.append(forecastIconEl);
                                        cardBodyDivEl.append(tempEL);
                                        cardBodyDivEl.append(windEL);
                                        cardBodyDivEl.append(humidityEL);
                                    }
                                })
                            }
                        })
                });
                // if fetch goes through but Open Weather can't find details for city
            } else {
                alert('Error: Open Weather could not find city')
            }
        })
        // if fetch fails
        .catch(function (error) {
            alert('Unable to connect to Open Weather');
        });
}

// Function for submit the city event
function submitCitySearch(event) {
    event.preventDefault();
    var city = titleCase(cityInputEl.val().trim());
    // Stops the user from searching for cities already searched and stored in local
    if (searchHistoryArray.searchedCity.includes(city)) {
        alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
        cityInputEl.val('');
    } else if (city) {
        getWeather(city);
        searchHistory(city);
        searchHistoryArray.searchedCity.push(city);
        saveSearchHistory();
        cityInputEl.val('');
    } else {
        alert('Please enter a city');
    }
}

// Submit the user data for the city input and fetch API
userFormEL.on('submit', submitCitySearch);

// Search button
$('#search-btn').on('click', function () {
    $('#current-weather').remove();
    $('#five-day').empty();
    $('#five-day-header').remove();
})