const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/items', require('./routes/itemRoutes'));

app.use('/api/browse', require('./routes/browseRoutes'));

app.use('/api/bookings', require('./routes/bookingRoutes'));

app.use('/api/payments', require('./routes/paymentRoutes'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Each photo must be under 5 MB' : err.message;
    return res.status(400).json({ message });
  }

  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});

module.exports = app;
