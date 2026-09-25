# Cirrus — Keyless Weather Dashboard

[![Quality](https://github.com/kooroosh1363/weather-app-1-with-js/actions/workflows/quality.yml/badge.svg)](https://github.com/kooroosh1363/weather-app-1-with-js/actions/workflows/quality.yml)
[![Deploy](https://github.com/kooroosh1363/weather-app-1-with-js/actions/workflows/pages.yml/badge.svg)](https://github.com/kooroosh1363/weather-app-1-with-js/actions/workflows/pages.yml)

Cirrus modernizes the repository's original 2023 JavaScript weather exercise into a responsive, keyless weather dashboard powered by Open-Meteo.

The old implementation embedded an OpenWeather API key directly in client-side JavaScript. The modern version removes that credential entirely and uses public Open-Meteo geocoding and forecast APIs, so the static frontend can be deployed without shipping a secret.

## Features

- city search
- Open-Meteo geocoding
- current temperature and feels-like temperature
- humidity and wind speed
- WMO weather-code descriptions
- five-day high/low forecast
- precipitation probability
- automatic local forecast timezone
- recent-search persistence
- loading, empty, no-result, and network-error states
- responsive light/dark interface
- zero runtime dependencies
- no Bootstrap or Google Fonts
- no client-side API key

## Security note

The original 2023 OpenWeather key remains visible in historical Git commits even though it has been removed from the current branch.

**Rotate/revoke that historical key in the OpenWeather account.**

Deleting a key from the latest file does not erase it from Git history and does not make the old key safe to reuse.

## Architecture

```text
city query
   │
   ▼
Open-Meteo geocoding
   │
   ▼
selected place
   │
   ├── recent search storage
   │
   ▼
Open-Meteo forecast
   │
   ▼
payload normalization
   │
   ▼
current conditions + 5-day UI
```

## Project structure

```text
.
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── api.js
│       ├── script.js
│       ├── storage.js
│       └── weather.js
├── tests/
│   ├── api.test.js
│   └── weather.test.js
├── package.json
└── .github/workflows/
    ├── quality.yml
    └── pages.yml
```

## Run locally

Because the app uses ES modules, serve it over HTTP:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Quality checks

Node.js 20+:

```bash
npm run check
```

This runs syntax checks and the complete Node test suite.

## Tests cover

- city-query normalization
- encoded geocoding URLs
- forecast request parameters
- WMO weather-code mapping
- day/night clear-sky handling
- location formatting
- weather-payload parsing
- display formatting
- geocoding success and empty results
- forecast API parsing
- non-OK service failures

## Engineering decisions

### Keyless public API

A static site cannot keep an API key secret. Moving from an embedded OpenWeather key to Open-Meteo removes the false assumption that a frontend credential can be hidden.

### Pure domain utilities

URL building, WMO mapping, payload parsing, and display formatting live outside the DOM layer and can be tested without a browser.

### Abort stale requests

A new search aborts the previous in-flight request so slower responses cannot overwrite a newer user choice.

### Defensive local storage

Recent searches improve convenience but are optional. Storage failures do not prevent weather lookup.

## Trade-offs

- The first geocoding result is selected automatically rather than presenting a disambiguation picker.
- Forecast data comes from Open-Meteo and is subject to its model/data availability.
- Recent searches are local to the browser.
- No background refresh runs when the page is idle.

## Deployment

The GitHub Pages workflow runs the quality gate before publishing the static site.

## Data source

Weather and geocoding data are provided by Open-Meteo.

## License

No license is currently included. Add one before redistributing the code as reusable software.
