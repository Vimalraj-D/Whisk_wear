const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const analyticsRoutes = require('../routes/analyticsRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const subscriberRoutes = require('../routes/subscriberRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// Security middlewares
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

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
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  const keySnippet = anonKey ? `${anonKey.substring(0, 8)}...${anonKey.substring(anonKey.length - 8)}` : 'missing';
  
  res.json({ 
    status: 'OK', 
    message: 'Whiskwear Backend API is running',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKeySnippet: keySnippet,
    supabaseKeyLength: anonKey.length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});