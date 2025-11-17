require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');
const bookingsRouter = require('./routes/bookings');
const manageRouter = require('./routes/manage');
const feedbackRouter = require('./routes/feedback');
const analyticsRouter = require('./routes/analytics');
const venuesRouter = require('./routes/venues');
const customQueryRouter = require('./routes/customQuery');

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/events', eventsRouter);
app.use('/api', usersRouter);
app.use('/api', bookingsRouter);
app.use('/api/manage', manageRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/venues', venuesRouter);
app.use('/api/analytics', customQueryRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
