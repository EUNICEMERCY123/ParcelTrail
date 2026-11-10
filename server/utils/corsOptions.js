// CORS configuration builder enforcing explicit allowed origins by default
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://parcel-trail.vercel.app'
];

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

function buildCorsOptions(rawEnv = process.env.CORS_ORIGIN) {
  const raw = typeof rawEnv === 'string' ? rawEnv.trim() : '';
  if (raw === '*') {
    return { origin: true, credentials: true };
  }

  const configured = raw
    ? raw.split(',').map(normalizeOrigin).filter(Boolean)
    : [];

  const allowSet = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);

  return {
    origin(origin, callback) {
      if (!origin || allowSet.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      const err = new Error(`CORS blocked for origin: ${origin}`);
      err.status = 403;
      err.statusCode = 403;
      return callback(err);
    },
    credentials: true
  };
}

module.exports = { buildCorsOptions, DEFAULT_ALLOWED_ORIGINS };
