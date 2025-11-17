const express = require('express')
const { pool } = require('../db')
const { requireAuth } = require('../middleware/auth')
const router = express.Router()

// Create or update feedback for an event by current user
router.post('/', requireAuth, async (req, res) => {
  const userId = req.user.userId
  const { eventId, rating, comments } = req.body
  if (!eventId || !rating) return res.status(400).json({ error: 'eventId and rating required' })
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' })
  try {
    // ensure user has a booking for the event
    const [can] = await pool.query(
      `SELECT 1
       FROM Booking b JOIN Ticket t ON b.ticketId = t.ticketId
       WHERE b.userId = ? AND t.eventId = ? LIMIT 1`,
      [userId, eventId]
    )
    if (!can.length) return res.status(403).json({ error: 'Feedback allowed for attendees only' })

    await pool.query(
      `INSERT INTO Feedback (userId, eventId, rating, comments)
       VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE rating=VALUES(rating), comments=VALUES(comments)`,
      [userId, eventId, rating, comments || null]
    )
    res.status(201).json({ ok: true })
  } catch (e) {
    console.error('[POST /api/feedback]', e)
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
})

// Get user's feedback history
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.userId
  try {
    const [rows] = await pool.query(
      `SELECT f.rating, f.comments, e.title AS eventTitle, e.eventId
       FROM Feedback f
       JOIN Event e ON f.eventId = e.eventId
       WHERE f.userId = ?
       ORDER BY e.eventId DESC`,
      [userId]
    )
    res.json(rows)
  } catch (e) {
    console.error('[GET /api/feedback/me]', e)
    res.status(500).json({ error: 'Failed to fetch feedback' })
  }
})

module.exports = router
