import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { TtlCache } from './cache.js';

const cache = new TtlCache(config.cacheTtlSeconds);

function buildSummary(location, forecast, fetchedAt) {
  const { current, daily } = forecast;
  return {
    location,
    current: {
      time: current.time,
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      windKmh: current.wind_speed_10m,
      weatherCode: current.weather_code,
      conditions: describeWeatherCode(current.weather_code),
    },
    daily: daily.time.map((date, i) => ({
      date,
      minC: daily.temperature_2m_min[i],
      maxC: daily.temperature_2m_max[i],
      precipitationChancePercent: daily.precipitation_probability_max[i] ?? null,
      weatherCode: daily.weather_code[i],
      conditions: describeWeatherCode(daily.weather_code[i]),
    })),
    fetchedAt,
  };
}

export async function getCityWeather(city) {
  const name = city.trim();
  const key = name.toLowerCase();

  const cached = cache.get(key);
  if (cached) {
    return { ...cached, cached: true };
  }

  const fetchedAt = new Date().toISOString();
  const location = await geocodeCity(name);
  const forecast = await getForecast(location.latitude, location.longitude);
  const summary = buildSummary(location, forecast, fetchedAt);

  cache.set(key, summary); // only reached on success, so failures are never cached
  return { ...summary, cached: false };
}

export function getCacheStats() {
  return cache.stats();
}