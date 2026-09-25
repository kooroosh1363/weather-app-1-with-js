import { loadWeather, searchPlaces, WeatherApiError } from "./api.js";
import { loadRecentPlaces, saveRecentPlace } from "./storage.js";
import {
  formatLocation,
  formatPercent,
  formatTemperature,
  formatWind,
  normalizeCityQuery,
  weatherDescriptor,
} from "./weather.js";

const form = document.querySelector("#weather-search");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const searchError = document.querySelector("#search-error");
const recentSearches = document.querySelector("#recent-searches");
const panel = document.querySelector("#weather-panel");

const initialState = document.querySelector("#initial-state");
const loadingState = document.querySelector("#loading-state");
const errorState = document.querySelector("#error-state");
const errorMessage = document.querySelector("#error-message");
const weatherContent = document.querySelector("#weather-content");

const locationName = document.querySelector("#location-name");
const conditionLabel = document.querySelector("#condition-label");
const conditionIcon = document.querySelector("#condition-icon");
const currentTemperature = document.querySelector("#current-temperature");
const currentTime = document.querySelector("#current-time");
const feelsLike = document.querySelector("#feels-like");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#wind-speed");
const timezone = document.querySelector("#timezone");
const forecastGrid = document.querySelector("#forecast-grid");

let activeController = null;
let recentPlaces = loadRecentPlaces();

const ICONS = Object.freeze({
  sun: "☀",
  moon: "☾",
  "sun-cloud": "◒",
  cloud: "☁",
  fog: "≋",
  drizzle: "⋰",
  rain: "☂",
  snow: "✳",
  storm: "ϟ",
});

function showState(name) {
  initialState.hidden = name !== "initial";
  loadingState.hidden = name !== "loading";
  errorState.hidden = name !== "error";
  weatherContent.hidden = name !== "content";
  panel.setAttribute("aria-busy", String(name === "loading"));
}

function setSearchError(message = "") {
  searchError.textContent = message;
  if (message) cityInput.setAttribute("aria-invalid", "true");
  else cityInput.removeAttribute("aria-invalid");
}

function placeSummary(place) {
  return {
    name: place.name,
    admin1: place.admin1 ?? "",
    country: place.country ?? "",
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
  };
}

function renderRecentPlaces() {
  recentSearches.replaceChildren();

  if (recentPlaces.length === 0) {
    const empty = document.createElement("span");
    empty.className = "recent-empty";
    empty.textContent = "No recent searches yet.";
    recentSearches.append(empty);
    return;
  }

  recentPlaces.forEach((place) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-button";
    button.textContent = formatLocation(place);
    button.addEventListener("click", () => selectPlace(place));
    recentSearches.append(button);
  });
}

function formatDayLabel(dateString, index) {
  if (index === 0) return "Today";

  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return dateString;

  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
}

function renderForecast(days) {
  forecastGrid.replaceChildren();

  days.forEach((day, index) => {
    const descriptor = weatherDescriptor(day.code, 1);
    const article = document.createElement("article");
    article.className = "forecast-card";

    const top = document.createElement("div");
    top.className = "forecast-top";

    const dayName = document.createElement("strong");
    dayName.textContent = formatDayLabel(day.date, index);

    const icon = document.createElement("span");
    icon.className = "forecast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = ICONS[descriptor.icon] ?? "☁";

    top.append(dayName, icon);

    const condition = document.createElement("p");
    condition.className = "forecast-condition";
    condition.textContent = descriptor.label;

    const temperatures = document.createElement("p");
    temperatures.className = "forecast-temperatures";
    temperatures.textContent = `${formatTemperature(day.max)} / ${formatTemperature(day.min)}`;

    const rain = document.createElement("p");
    rain.className = "forecast-rain";
    rain.textContent = `Precipitation ${formatPercent(day.precipitation)}`;

    article.append(top, condition, temperatures, rain);
    forecastGrid.append(article);
  });
}

function renderWeather(place, weather) {
  const descriptor = weatherDescriptor(weather.current.code, weather.current.isDay);

  locationName.textContent = formatLocation(place);
  conditionLabel.textContent = descriptor.label;
  conditionIcon.textContent = ICONS[descriptor.icon] ?? "☁";
  currentTemperature.textContent = formatTemperature(weather.current.temperature);
  currentTime.textContent = weather.current.time
    ? `Updated ${weather.current.time.replace("T", " ")}`
    : "Current conditions";
  feelsLike.textContent = formatTemperature(weather.current.apparent);
  humidity.textContent = formatPercent(weather.current.humidity);
  windSpeed.textContent = formatWind(weather.current.wind);
  timezone.textContent = String(weather.timezone ?? "—");
  renderForecast(weather.daily);
  showState("content");
}

async function selectPlace(place) {
  activeController?.abort();
  activeController = new AbortController();
  setSearchError("");
  showState("loading");

  try {
    const weather = await loadWeather(place, { signal: activeController.signal });
    const compact = placeSummary(place);
    recentPlaces = saveRecentPlace(compact);
    renderRecentPlaces();
    cityInput.value = formatLocation(compact);
    renderWeather(compact, weather);
  } catch (error) {
    if (error?.name === "AbortError") return;

    errorMessage.textContent =
      error instanceof WeatherApiError
        ? error.message
        : "Unable to load weather data. Please try again.";
    showState("error");
  }
}

async function handleSearch(event) {
  event.preventDefault();

  const query = normalizeCityQuery(cityInput.value);
  if (!query) {
    setSearchError("Enter a city name.");
    cityInput.focus();
    return;
  }

  activeController?.abort();
  activeController = new AbortController();
  setSearchError("");
  showState("loading");
  searchButton.disabled = true;

  try {
    const places = await searchPlaces(query, { signal: activeController.signal });

    if (places.length === 0) {
      setSearchError("No matching city was found. Try a broader place name.");
      showState("initial");
      return;
    }

    await selectPlace(places[0]);
  } catch (error) {
    if (error?.name === "AbortError") return;

    errorMessage.textContent =
      error instanceof WeatherApiError
        ? error.message
        : "Unable to search for that city right now.";
    showState("error");
  } finally {
    searchButton.disabled = false;
  }
}

cityInput.addEventListener("input", () => {
  if (cityInput.hasAttribute("aria-invalid")) setSearchError("");
});

form.addEventListener("submit", handleSearch);

renderRecentPlaces();
showState("initial");
