import { HttpError } from '../lib/http-error.js';

// Express treats a middleware with four parameters as an error handler.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    const body = { error: { message: err.message } };
    // details only appears on 400 errors
    if (err.status === 400 && err.details !== undefined) {
      body.error.details = err.details;
    }
    return res.status(err.status).json(body);
  }

  // Anything else is a bug. The details go to the terminal, never to the client.
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
