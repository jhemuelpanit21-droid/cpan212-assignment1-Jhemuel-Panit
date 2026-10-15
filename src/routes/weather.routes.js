import { Router } from 'express';
import { parseCity } from '../validators/weather.validators.js';
import { getCityWeather } from '../lib/weather.js';

export const weatherRouter = Router();

const ATTRIBUTION = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';

weatherRouter.get('/weather', async (req, res) => {
  const city = parseCity(req.query);
  const data = await getCityWeather(city);
  res.json({ data, attribution: ATTRIBUTION });
});

// compare route stays as it was for now
weatherRouter.get('/compare', (req, res) => {
  res.status(501).json({ error: { message: 'Not written yet: GET /api/compare' } });
});
