import test from "node:test";
import assert from "node:assert/strict";

import {
  buildForecastUrl,
  buildGeocodingUrl,
  formatLocation,
  formatPercent,
  formatTemperature,
  formatWind,
  normalizeCityQuery,
  parseWeatherPayload,
  weatherDescriptor,
} from "../assets/js/weather.js";

test("normalizes city queries and builds encoded geocoding URLs", () => {
  assert.equal(normalizeCityQuery("  New   York  "), "New York");

  const url = new URL(buildGeocodingUrl("São Paulo"));
  assert.equal(url.hostname, "geocoding-api.open-meteo.com");
  assert.equal(url.searchParams.get("name"), "São Paulo");
  assert.equal(url.searchParams.get("count"), "5");
});

test("forecast URL requests Celsius, km/h, current data, daily data, and auto timezone", () => {
  const url = new URL(buildForecastUrl(41.7151, 44.8271));
  assert.equal(url.hostname, "api.open-meteo.com");
  assert.equal(url.searchParams.get("temperature_unit"), "celsius");
  assert.equal(url.searchParams.get("wind_speed_unit"), "kmh");
  assert.equal(url.searchParams.get("timezone"), "auto");
  assert.equal(url.searchParams.get("forecast_days"), "5");
  assert.match(url.searchParams.get("current"), /temperature_2m/);
  assert.match(url.searchParams.get("daily"), /temperature_2m_max/);
});

test("maps WMO weather codes and night clear sky", () => {
  assert.deepEqual(weatherDescriptor(0, 1), { label: "Clear sky", icon: "sun" });
  assert.deepEqual(weatherDescriptor(0, 0), { label: "Clear sky", icon: "moon" });
  assert.equal(weatherDescriptor(95, 1).label, "Thunderstorm");
  assert.equal(weatherDescriptor(999, 1).label, "Unknown conditions");
});

test("formats a deduplicated place label", () => {
  assert.equal(
    formatLocation({ name: "Tbilisi", admin1: "Tbilisi", country: "Georgia" }),
    "Tbilisi, Georgia",
  );
});

test("parses current and five-day daily payloads", () => {
  const parsed = parseWeatherPayload({
    timezone: "Asia/Tbilisi",
    current: {
      temperature_2m: 18.4,
      apparent_temperature: 17.6,
      relative_humidity_2m: 62,
      wind_speed_10m: 12.2,
      weather_code: 2,
      is_day: 1,
      time: "2026-09-25T10:00",
    },
    daily: {
      time: ["2026-09-25", "2026-09-26"],
      weather_code: [2, 61],
      temperature_2m_max: [22.3, 19.4],
      temperature_2m_min: [12.1, 10.2],
      precipitation_probability_max: [10, 65],
      sunrise: ["2026-09-25T06:50", "2026-09-26T06:51"],
      sunset: ["2026-09-25T18:52", "2026-09-26T18:50"],
    },
  });

  assert.equal(parsed.current.temperature, 18.4);
  assert.equal(parsed.daily.length, 2);
  assert.equal(parsed.daily[1].precipitation, 65);
});

test("formats display values defensively", () => {
  assert.equal(formatTemperature(18.6), "19°");
  assert.equal(formatPercent(63.2), "63%");
  assert.equal(formatWind(12.7), "13 km/h");
  assert.equal(formatTemperature(Number.NaN), "—");
});
