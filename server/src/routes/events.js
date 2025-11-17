const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// List events with venue and avg rating
// List events with optional filters & pagination
router.get('/', async (req, res) => {
  try {
    const { q, category, sort = 'startDate', order = 'asc', page = 1, limit = 12 } = req.query
    const allowedSort = new Set(['startDate', 'title', 'category'])
    const sortCol = allowedSort.has(String(sort)) ? String(sort) : 'startDate'
    const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC'
    const off = (Number(page) - 1) * Number(limit)

    const params = []
    const where = []
    if (q) { where.push('(e.title LIKE ? OR e.eventDescription LIKE ? OR v.venueName LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`) }
    if (category) { where.push('e.category = ?'); params.push(category) }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [rows] = await pool.query(
      `SELECT 
         e.eventId,
         e.title,
         e.category,
         e.eventDescription,
         e.startDate,
         e.duration,
         v.venueName,
         v.venueAddress,
         e.organizerId,
         GetAverageRating(e.eventId) AS avgRating,
         GetEventEndDate(e.startDate, e.duration) AS endDate,
         (
           SELECT IFNULL(SUM(p.amount), 0)
           FROM Ticket t
           JOIN Booking b ON t.ticketId = b.ticketId
           JOIN Payment p ON b.bookingId = p.bookingId AND p.paymentStatus = 'Successful'
           WHERE t.eventId = e.eventId
         ) AS totalRevenue
      FROM Event e
       LEFT JOIN EventVenue ev ON e.eventId = ev.eventId
        LEFT JOIN Venue v ON ev.venueId = v.venueId
       ${whereSql}
       ORDER BY e.${sortCol} ${dir}
       LIMIT ${Number(limit)} OFFSET ${off}`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /api/events] error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Event details with tickets, sponsors, staff, feedback
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [eventRows] = await pool.query(
      `SELECT e.*, v.venueName, v.venueAddress, v.capacity
       FROM Event e
       LEFT JOIN EventVenue ev ON e.eventId = ev.eventId
       LEFT JOIN Venue v ON ev.venueId = v.venueId
       WHERE e.eventId = ?`,
      [id]
    );
    if (eventRows.length === 0) return res.status(404).json({ error: 'Event not found' });

    const [tickets] = await pool.query(
      `SELECT ticketId, tCategory as category, price, availability
       FROM Ticket WHERE eventId = ? ORDER BY price ASC`,
      [id]
    );
    const [sponsors] = await pool.query(
      `SELECT s.sponsorId, s.sponsorName, s.contribution
       FROM EventSponsor es JOIN Sponsor s ON es.sponsorId = s.sponsorId
       WHERE es.eventId = ?`,
      [id]
    );
    const [staff] = await pool.query(
      `SELECT st.staffId, st.staffName, st.staffRole, es.assignment
       FROM EventStaff es JOIN Staff st ON es.staffId = st.staffId
       WHERE es.eventId = ?`,
      [id]
    );
    const [feedback] = await pool.query(
      `SELECT u.userName, f.rating, f.comments
       FROM Feedback f JOIN Users u ON f.userId = u.userId
       WHERE f.eventId = ? ORDER BY f.rating DESC`,
      [id]
    );

    res.json({
      event: eventRows[0],
      tickets,
      sponsors,
      staff,
      feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Get events by category using stored procedure
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const [rows] = await pool.query('CALL GetEventsByCategory(?)', [category]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events by category' });
  }
});

// Get event revenue summary using stored procedure
router.get('/:id/revenue', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('CALL EventRevenueSummary(?)', [id]);
    res.json(rows[0][0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event revenue' });
  }
});

module.exports = router;
