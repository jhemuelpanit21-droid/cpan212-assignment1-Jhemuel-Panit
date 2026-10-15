import { config } from '../config.js';
import { HttpError } from './http-error.js';

// This is the only file that calls fetch or knows Open-Meteo's URLs.

async function fetchJson(url, service) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });
    if (!res.ok) {
      throw new HttpError(502, `Could not get a valid response from the ${service} service`);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (err.name === 'TimeoutError') {
      throw new HttpError(
        504,
        `The ${service} service did not respond within ${config.upstreamTimeoutMs} ms`
      );
    }
    // Network failure (TypeError: fetch failed) or a body that isn't JSON (SyntaxError)
    throw new HttpError(502, `Could not get a valid response from the ${service} service`);
  }
}

export async function geocodeCity(name) {
  const params = new URLSearchParams({
    name,
    count: '1',
    language: 'en',
    format: 'json',
  });
  const data = await fetchJson(`${config.geocodingUrl}/search?${params}`, 'geocoding');

  const match = Array.isArray(data?.results) ? data.results[0] : undefined;
  if (!match) {
    throw new HttpError(404, `City not found: ${name}`);
  }

  return {
    name: match.name,
    region: match.admin1 ?? null,
    country: match.country ?? null,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone,
  };
}

export async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '3',
  });
  return fetchJson(`${config.forecastUrl}/forecast?${params}`, 'forecast');
}