const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { validateEnv } = require('../config/env');
validateEnv();

const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const analyticsRoutes = require('../routes/analyticsRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const subscriberRoutes = require('../routes/subscriberRoutes');

const app = express();

// Trust exactly one proxy hop (Render's reverse proxy).
// Using `1` (not `true`) so only the first X-Forwarded-For entry is trusted,
// preventing clients from spoofing their IP to bypass rate limits.
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// CORS is restricted to explicitly allowed origins (set FRONTEND_URL in .env,
// comma-separated for multiple). Falling back to '*' here would let any
// website make authenticated cross-origin requests against this API.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS. Configured allowed origins: ${allowedOrigins.join(', ')}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// General API rate limit.
// Set higher than the old 100 because a single page load can fire several
// parallel requests (products, categories, subcategories, etc.).
// Auth-specific limiters below remain tight for brute-force protection.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cookieParser());

// Tighter rate limits for sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait before trying again.' },
});

// General auth endpoints (initiate, verify, resend, complete)
app.use('/api/auth', authLimiter);
// Strict limits on login, forgot-password, reset-password (brute-force targets)
app.use('/api/auth/user/login', strictAuthLimiter);
app.use('/api/auth/user/forgot-password', strictAuthLimiter);
app.use('/api/auth/user/reset-password', strictAuthLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Whiskwear Backend API is running'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }

  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
