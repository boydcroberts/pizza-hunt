const express = require('express');
const mongoose = require('mongoose');
const apiRequestBuckets = new Map();

const app = express();
const PORT = process.env.PORT || 3001;
const API_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const API_RATE_LIMIT_MAX_REQUESTS = 120;

const buildSecurityHeaders = (req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "img-src 'self' data:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(),microphone=(),geolocation=()');
  next();
};

const apiRateLimiter = (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = apiRequestBuckets.get(ip) || { start: now, count: 0 };

  if (now - bucket.start > API_RATE_LIMIT_WINDOW_MS) {
    bucket.start = now;
    bucket.count = 0;
  }

  bucket.count += 1;
  apiRequestBuckets.set(ip, bucket);

  if (bucket.count > API_RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  return next();
};

app.set('trust proxy', 1);

mongoose.set('strictQuery', true);
mongoose.set('debug', false);

app.use(buildSecurityHeaders);
app.use(apiRateLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static('public'));

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizza-hunt',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use(require('./routes'));

app.listen(PORT, () => console.log(`🌍 Connected on localhost:${PORT}`));
