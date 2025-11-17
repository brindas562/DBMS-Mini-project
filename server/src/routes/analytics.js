const express = require('express')
const { pool } = require('../db')
const { requireRole, requireAuth } = require('../middleware/auth')
const router = express.Router()

// Dashboard analytics (organizer/admin)
router.get('/', requireAuth, async (req, res) => {
  const { userRole } = req.user
  if (userRole !== 'Admin' && userRole !== 'Organizer') {
    return res.status(403).json({ error: 'Access denied' })
  }

  try {
    // Total revenue
    const [revenue] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue 
       FROM Payment WHERE paymentStatus = 'Successful'`
    )

    // Total bookings
    const [bookings] = await pool.query(
      `SELECT COUNT(*) as totalBookings FROM Booking`
    )

    // Average rating
    const [rating] = await pool.query(
      `SELECT ROUND(AVG(rating), 2) as avgRating FROM Feedback`
    )

    // Top events by revenue
    const [topEvents] = await pool.query(
      `SELECT 
        e.eventId, e.title, e.category,
        COALESCE(SUM(p.amount), 0) as totalRevenue,
        COUNT(b.bookingId) as bookingCount
       FROM Event e
       LEFT JOIN Ticket t ON e.eventId = t.eventId
       LEFT JOIN Booking b ON t.ticketId = b.ticketId
       LEFT JOIN Payment p ON b.bookingId = p.bookingId AND p.paymentStatus = 'Successful'
       GROUP BY e.eventId
       ORDER BY totalRevenue DESC
       LIMIT 5`
    )

    // Top venues
    const [topVenues] = await pool.query(
      `SELECT 
        v.venueId, v.venueName, v.capacity,
        COUNT(ev.eventId) as eventCount
       FROM Venue v
       LEFT JOIN EventVenue ev ON v.venueId = ev.venueId
       GROUP BY v.venueId
       ORDER BY eventCount DESC
       LIMIT 5`
    )

    // Recent bookings
    const [recentBookings] = await pool.query(
      `SELECT 
        b.bookingId, b.bookingDate, b.bookingStatus,
        u.userName, e.title as eventTitle,
        t.tCategory as ticketCategory, t.price
       FROM Booking b
       JOIN Users u ON b.userId = u.userId
       JOIN Ticket t ON b.ticketId = t.ticketId
       JOIN Event e ON t.eventId = e.eventId
       ORDER BY b.bookingDate DESC
       LIMIT 10`
    )

    res.json({
      totalRevenue: revenue[0].totalRevenue,
      totalBookings: bookings[0].totalBookings,
      avgRating: rating[0].avgRating,
      topEvents,
      topVenues,
      recentBookings
    })
  } catch (e) {
    console.error('[GET /api/analytics]', e)
    res.status(500).json({ error: 'Failed to load analytics' })
  }
})

// High rated events from view
router.get('/high-rated', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM HighRatedEvents ORDER BY avg_rating DESC')
    res.json(rows)
  } catch (e) {
    console.error('[GET /api/analytics/high-rated]', e)
    res.status(500).json({ error: 'Failed to load' })
  }
})

// Revenue summary per event (admin/organizer)
router.get('/revenue/:eventId', requireRole(['Organizer', 'Admin'], pool), async (req, res) => {
  const { eventId } = req.params
  try {
    const [rows] = await pool.query(
      `SELECT e.title,
              COUNT(b.bookingId) AS total_tickets_sold,
              SUM(CASE WHEN p.paymentStatus='Successful' THEN p.amount ELSE 0 END) AS total_revenue
       FROM Event e
       JOIN Ticket t ON e.eventId = t.eventId
       LEFT JOIN Booking b ON t.ticketId = b.ticketId
       LEFT JOIN Payment p ON b.bookingId = p.bookingId
       WHERE e.eventId = ?
       GROUP BY e.eventId, e.title`,
      [eventId]
    )
    res.json(rows[0] || {})
  } catch (e) {
    console.error('[GET /api/analytics/revenue/:eventId]', e)
    res.status(500).json({ error: 'Failed to load' })
  }
})

// CSV export of bookings (admin)
router.get('/bookings.csv', requireRole(['Admin'], pool), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.bookingId, u.userName, u.userEmail, e.title, b.bookingDate, b.bookingStatus, t.tCategory, t.price
       FROM Booking b
       JOIN Users u ON b.userId = u.userId
       JOIN Ticket t ON b.ticketId = t.ticketId
       JOIN Event e ON t.eventId = e.eventId
       ORDER BY b.bookingDate DESC`
    )
    const header = Object.keys(rows[0] || { bookingId: '', userName: '', userEmail: '', title: '', bookingDate: '', bookingStatus: '', tCategory: '', price: '' })
    const csv = [header.join(',')].concat(
      rows.map(r => header.map(k => String(r[k]).replaceAll('"', '""')).map(v => /[",\n]/.test(v) ? `"${v}"` : v).join(','))
    ).join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"')
    res.send(csv)
  } catch (e) {
    console.error('[GET /api/analytics/bookings.csv]', e)
    res.status(500).json({ error: 'Failed to export' })
  }
})

module.exports = router
