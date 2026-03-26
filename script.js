// API KEYS
const _GOOGLE_MAPS_API_KEY = "GOOGLE_MAPS_API_KEY";
const OPENWEATHER_API_KEY = "OPENWEATHER_API_KEY";

// MAP VARIABLES
let map;
let marker;

// ELEMENTS
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

// ================= MAP INIT =================
function initMap() {
  const defaultLocation = { lat: 7.1907, lng: 125.4553 }; // Davao

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 10
  });

  marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    title: "Davao City"
  });
}

// ================= LOAD GOOGLE MAPS =================
function loadGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${_GOOGLE_MAPS_API_KEY}&callback=initMap`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// ================= UI HELPERS =================
function showMessage(text, isError = true) {
  message.textContent = text;
  message.style.color = isError ? "#d9534f" : "#28a745";
}

function clearMessage() {
  message.textContent = "";
}

function updateWeatherUI(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${data.main.temp} °C`;
  description.textContent = data.weather[0].description;
  weatherResult.classList.remove("hidden");
}

// ================= MAP UPDATE =================
function updateMap(lat, lon, city) {
  const location = { lat: lat, lng: lon };

  map.setCenter(location);
  map.setZoom(12);

  if (marker) {
    marker.setMap(null);
  }

  marker = new google.maps.Marker({
    position: location,
    map: map,
    title: city
  });
}


async function getCoordinates(city) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch location.");
  }

  const data = await response.json();

  if (!data.length) {
    throw new Error("City not found.");
  }

  return data[0];
}

async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather.");
  }

  const data = await response.json();

  if (!data.main || !data.weather) {
    throw new Error("Invalid weather data.");
  }

  return data;
}


async function searchCity() {
  const city = cityInput.value.trim();

  weatherResult.classList.add("hidden");
  clearMessage();

  if (!city) {
    showMessage("Please enter a city.");
    return;
  }

  try {
    showMessage("Loading...", false);

    const location = await getCoordinates(city);
    const weather = await getWeather(location.lat, location.lon);

    updateWeatherUI(weather);
    updateMap(location.lat, location.lon, weather.name);

    showMessage("Success!", false);
  } catch (error) {
    showMessage(error.message);
  }
}


searchBtn.addEventListener("click", searchCity);

cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchCity();
  }
});


window.onload = loadGoogleMaps;