# City Weather API
 
An Express service that answers weather questions by calling [Open-Meteo](https://open-meteo.com/). It turns a city name into coordinates, fetches the current weather and a 3-day forecast, and returns a clean summary. It can compare 2 to 5 cities at once, keeps working when one lookup fails, stops waiting when Open-Meteo is too slow, and caches answers in memory so the same question does not cost another upstream call.
 
## Run it
 
Requires Node.js 24 (`node -v` should print `v24...`).
 
```bash
npm install
cp .env.example .env
npm run dev
```
 
On Windows Command Prompt, use `copy .env.example .env` instead of `cp`.
 
`npm run dev` restarts the server when files or `.env` change. `npm start` runs it once. The server listens on http://localhost:4000 by default. The service also runs with no `.env` file, because every variable has a default.
 
## Environment variables
 
| Variable | Default | Controls |
|---|---|---|
| `PORT` | `4000` | The port the server listens on |
| `GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1` | Base URL of the geocoding API |
| `FORECAST_URL` | `https://api.open-meteo.com/v1` | Base URL of the forecast API |
| `UPSTREAM_TIMEOUT_MS` | `5000` | How long to wait for each Open-Meteo request |
| `CACHE_TTL_SECONDS` | `600` | How long a cached answer stays valid |
 
## Endpoints
 
### GET /api/weather
 
Current weather and a 3-day forecast for one city.
 
```
GET /api/weather?city=Toronto
```
 
Responds `200` with `{ "data": <weather summary>, "attribution": "..." }`. The summary has `location`, `current`, `daily` (3 entries, in date order), `fetchedAt` and `cached`. Values are copied from Open-Meteo as they arrive: temperatures in °C and wind speed in km/h, with no rounding.
 
- `400` with `details.city` when `city` is missing, empty, repeated, or not 2 to 60 characters after trimming.
- `404` when no city matches.
- `502` when Open-Meteo fails or sends an invalid answer, and `504` when it does not answer in time.
### GET /api/compare
 
The same lookup for 2 to 5 cities at once.
 
```
GET /api/compare?cities=Toronto,Vancouver,Halifax
```
 
Responds `200` whenever the query is valid, even if some or all cities failed. `data.cities` has one entry per requested city, in the order requested: `{ city, ok: true, weather }` or `{ city, ok: false, error: { status, message } }`. `data.summary` has `succeeded`, `failed`, `warmest` and `coldest`.
 
- `400` with `details.cities` when the list is missing, empty, repeated, has an empty name, has fewer than 2 or more than 5 names, has a name that is not 2 to 60 characters, or lists the same city twice ignoring capitals.
### GET /api/cache/stats
 
How many answers are cached and how often the cache was used.
 
```
GET /api/cache/stats
```
 
Responds `200` with `{ "data": { "entries", "hits", "misses", "ttlSeconds" } }`.
 
### Errors
 
Every error uses `{ "error": { "message": "...", "details": ... } }`, where `details` only appears on `400` errors. Unknown routes get `404`. Unexpected errors get `500` with the message `Internal server error`.
 
## Data source
 
Weather data by [Open-Meteo.com](https://open-meteo.com/).

## AI use

I used Claude. I used it to debugged, make the code pretty because im a messy coder, used it to help me fix mistakes and cheak if the code is working not only ones but make it reliable.



