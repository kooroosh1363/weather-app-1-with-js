import {
  buildForecastUrl,
  buildGeocodingUrl,
  parseWeatherPayload,
} from "./weather.js";

export class WeatherApiError extends Error {
  constructor(message, { cause, status } = {}) {
    super(message, { cause });
    this.name = "WeatherApiError";
    this.status = status ?? null;
  }
}

async function requestJson(url, { fetchImpl = fetch, signal } = {}) {
  let response;

  try {
    response = await fetchImpl(url, { signal });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new WeatherApiError("Unable to reach the weather service.", { cause: error });
  }

  if (!response.ok) {
    throw new WeatherApiError("The weather service returned an error.", {
      status: response.status,
    });
  }

  try {
    return await response.json();
  } catch (error) {
    throw new WeatherApiError("The weather service returned invalid data.", {
      cause: error,
      status: response.status,
    });
  }
}

export async function searchPlaces(query, options = {}) {
  const payload = await requestJson(buildGeocodingUrl(query), options);
  return Array.isArray(payload.results) ? payload.results : [];
}

export async function loadWeather(place, options = {}) {
  const latitude = Number(place?.latitude);
  const longitude = Number(place?.longitude);
  const payload = await requestJson(buildForecastUrl(latitude, longitude), options);
  return parseWeatherPayload(payload);
}
