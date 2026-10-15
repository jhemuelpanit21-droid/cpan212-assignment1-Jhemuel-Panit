import { HttpError } from '../lib/http-error.js';

const MIN_LENGTH = 2;
const MAX_LENGTH = 60;

function invalid(field, message) {
  return new HttpError(400, 'Invalid query', { [field]: message });
}

// value is req.query.city: undefined, a string, or an array when repeated.
// Returns the trimmed city name, or throws a 400.
export function parseCity(value) {
  if (value === undefined) throw invalid('city', 'city is required');
  if (Array.isArray(value)) throw invalid('city', 'city must be sent only once');
  if (typeof value !== 'string') throw invalid('city', 'city must be text');

  const city = value.trim();
  if (city === '') throw invalid('city', 'city is required');
  if (city.length < MIN_LENGTH || city.length > MAX_LENGTH) {
    throw invalid('city', 'city must be 2 to 60 characters');
  }
  return city;
}

// value is req.query.cities. Returns an array of 2 to 5 trimmed, unique
// city names, or throws a 400.
export function parseCities(value) {
  if (value === undefined) throw invalid('cities', 'cities is required');
  if (Array.isArray(value)) throw invalid('cities', 'cities must be sent only once');
  if (typeof value !== 'string') throw invalid('cities', 'cities must be text');
  if (value.trim() === '') throw invalid('cities', 'cities is required');

  const names = value.split(',').map((name) => name.trim());

  if (names.some((name) => name === '')) {
    throw invalid('cities', 'cities must not contain an empty name');
  }
  if (names.length < 2 || names.length > 5) {
    throw invalid('cities', 'cities must list 2 to 5 cities');
  }

  const seen = new Set();
  for (const name of names) {
    if (name.length < MIN_LENGTH || name.length > MAX_LENGTH) {
      throw invalid('cities', `"${name}" must be 2 to 60 characters`);
    }
    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw invalid('cities', `"${name}" is listed more than once`);
    }
    seen.add(key);
  }
  return names;
}
