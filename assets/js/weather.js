const WEATHER_CODES = new Map([
  [0, ["Clear sky", "sun"]],
  [1, ["Mainly clear", "sun-cloud"]],
  [2, ["Partly cloudy", "sun-cloud"]],
  [3, ["Overcast", "cloud"]],
  [45, ["Fog", "fog"]],
  [48, ["Rime fog", "fog"]],
  [51, ["Light drizzle", "drizzle"]],
  [53, ["Drizzle", "drizzle"]],
  [55, ["Heavy drizzle", "drizzle"]],
  [56, ["Freezing drizzle", "drizzle"]],
  [57, ["Heavy freezing drizzle", "drizzle"]],
  [61, ["Light rain", "rain"]],
  [63, ["Rain", "rain"]],
  [65, ["Heavy rain", "rain"]],
  [66, ["Freezing rain", "rain"]],
  [67, ["Heavy freezing rain", "rain"]],
  [71, ["Light snow", "snow"]],
  [73, ["Snow", "snow"]],
  [75, ["Heavy snow", "snow"]],
  [77, ["Snow grains", "snow"]],
  [80, ["Light rain showers", "rain"]],
  [81, ["Rain showers", "rain"]],
  [82, ["Heavy rain showers", "rain"]],
  [85, ["Snow showers", "snow"]],
  [86, ["Heavy snow showers", "snow"]],
  [95, ["Thunderstorm", "storm"]],
  [96, ["Thunderstorm with hail", "storm"]],
  [99, ["Severe thunderstorm with hail", "storm"]],
]);

export function normalizeCityQuery(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function buildGeocodingUrl(query, { count = 5 } = {}) {
  const normalized = normalizeCityQuery(query);
  if (!normalized) throw new TypeError("City query is required.");

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", normalized);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  return url.toString();
}

export function buildForecastUrl(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new TypeError("Latitude and longitude must be finite numbers.");
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "weather_code",
      "is_day",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
    ].join(","),
  );
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "5");
  return url.toString();
}

export function weatherDescriptor(code, isDay = 1) {
  const [label, icon] = WEATHER_CODES.get(Number(code)) ?? ["Unknown conditions", "cloud"];
  return {
    label,
    icon: Number(isDay) === 0 && icon === "sun" ? "moon" : icon,
  };
}

export function formatLocation(place) {
  const parts = [place?.name, place?.admin1, place?.country]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return [...new Set(parts)].join(", ");
}

export function parseWeatherPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new TypeError("Weather payload must be an object.");
  }

  const current = payload.current;
  const daily = payload.daily;

  if (!current || !daily || !Array.isArray(daily.time)) {
    throw new TypeError("Weather payload is missing current or daily data.");
  }

  const rows = daily.time.map((date, index) => ({
    date,
    code: Number(daily.weather_code?.[index]),
    max: Number(daily.temperature_2m_max?.[index]),
    min: Number(daily.temperature_2m_min?.[index]),
    precipitation: Number(daily.precipitation_probability_max?.[index]),
    sunrise: daily.sunrise?.[index] ?? null,
    sunset: daily.sunset?.[index] ?? null,
  }));

  return {
    timezone: payload.timezone ?? "auto",
    current: {
      temperature: Number(current.temperature_2m),
      apparent: Number(current.apparent_temperature),
      humidity: Number(current.relative_humidity_2m),
      wind: Number(current.wind_speed_10m),
      code: Number(current.weather_code),
      isDay: Number(current.is_day),
      time: current.time ?? null,
    },
    daily: rows,
  };
}

export function formatTemperature(value) {
  return Number.isFinite(value) ? `${Math.round(value)}°` : "—";
}

export function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : "—";
}

export function formatWind(value) {
  return Number.isFinite(value) ? `${Math.round(value)} km/h` : "—";
}
