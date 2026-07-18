const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/webhookController').razorpayWebhook
);

app.use(express.json());
app.use(mongoSanitize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts - try again in 15 minutes' },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/items', require('./routes/itemRoutes'));

app.use('/api/browse', require('./routes/browseRoutes'));

app.use('/api/bookings', require('./routes/bookingRoutes'));

app.use('/api/payments', require('./routes/paymentRoutes'));

app.use('/api/disputes', require('./routes/disputeRoutes'));

app.use('/api/reviews', require('./routes/reviewRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Each photo must be under 5 MB' : err.message;
    return res.status(400).json({ message });
  }
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first?.message || 'Invalid data' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});

module.exports = app;