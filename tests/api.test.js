import test from "node:test";
import assert from "node:assert/strict";

import { loadWeather, searchPlaces, WeatherApiError } from "../assets/js/api.js";

function response(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return body;
    },
  };
}

test("searchPlaces returns geocoding results", async () => {
  const fetchImpl = async () =>
    response({ results: [{ name: "Tbilisi", latitude: 41.7, longitude: 44.8 }] });

  const places = await searchPlaces("Tbilisi", { fetchImpl });
  assert.equal(places[0].name, "Tbilisi");
});

test("searchPlaces returns an empty list when API omits results", async () => {
  const places = await searchPlaces("Missing", {
    fetchImpl: async () => response({}),
  });
  assert.deepEqual(places, []);
});

test("loadWeather parses forecast payload", async () => {
  const fetchImpl = async () =>
    response({
      timezone: "UTC",
      current: {
        temperature_2m: 10,
        apparent_temperature: 9,
        relative_humidity_2m: 50,
        wind_speed_10m: 8,
        weather_code: 0,
        is_day: 1,
        time: "2026-09-25T10:00",
      },
      daily: {
        time: ["2026-09-25"],
        weather_code: [0],
        temperature_2m_max: [15],
        temperature_2m_min: [5],
        precipitation_probability_max: [0],
        sunrise: ["2026-09-25T06:00"],
        sunset: ["2026-09-25T18:00"],
      },
    });

  const weather = await loadWeather(
    { latitude: 1, longitude: 2 },
    { fetchImpl },
  );

  assert.equal(weather.current.temperature, 10);
  assert.equal(weather.daily[0].max, 15);
});

test("API client turns non-OK responses into WeatherApiError", async () => {
  await assert.rejects(
    () =>
      searchPlaces("Test", {
        fetchImpl: async () => response({}, { ok: false, status: 503 }),
      }),
    (error) => error instanceof WeatherApiError && error.status === 503,
  );
});
