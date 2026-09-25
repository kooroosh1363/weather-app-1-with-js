import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../assets/js/script.js", import.meta.url), "utf8");

test("page has no Bootstrap or Google Fonts runtime dependency", () => {
  assert.doesNotMatch(html, /bootstrap|fonts\.googleapis\.com|fonts\.gstatic\.com/i);
});

test("application is loaded as an ES module", () => {
  assert.match(
    html,
    /<script[^>]+type="module"[^>]+src="\.\/assets\/js\/script\.js"/,
  );
});

test("current application does not embed the legacy OpenWeather endpoint or API key", () => {
  assert.doesNotMatch(app, /api\.openweathermap\.org|appid=|apiKey\s*=/i);
});

test("weather UI exposes accessible search and live result state", () => {
  assert.match(html, /id="weather-search"/);
  assert.match(html, /id="weather-panel"[^>]*aria-live="polite"/);
  assert.match(html, /id="search-error"[^>]*role="alert"/);
});
