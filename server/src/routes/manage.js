const express = require('express')
const { pool } = require('../db')
const { requireRole } = require('../middleware/auth')
const router = express.Router()

// --- User management (Admin only) ---
// Create user
router.post('/users', requireRole(['Admin'], pool), async (req, res) => {
  const { userName, userEmail, userPhone, userRole, userPassword } = req.body
  if (!userName || !userEmail || !userRole || !userPassword) return res.status(400).json({ error: 'Missing fields' })
  try {
    const [[maxU]] = await pool.query('SELECT IFNULL(MAX(userId), 0) AS maxId FROM Users')
    const userId = Number(maxU.maxId) + 1
    await pool.query('INSERT INTO Users (userId, userName, userEmail, userPhone, userRole, userPassword) VALUES (?,?,?,?,?,?)', [userId, userName, userEmail, userPhone || null, userRole, userPassword])
    res.status(201).json({ userId })
  } catch (e) {
    console.error('[POST /api/manage/users]', e)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// List users
router.get('/users', requireRole(['Admin'], pool), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT userId, userName, userEmail, userPhone, userRole FROM Users ORDER BY userId')
    res.json(rows)
  } catch (e) {
    console.error('[GET /api/manage/users]', e)
    res.status(500).json({ error: 'Failed to list users' })
  }
})

// Update user role/details
router.put('/users/:id', requireRole(['Admin'], pool), async (req, res) => {
  const { id } = req.params
  const { userName, userEmail, userPhone, userRole, userPassword } = req.body
  try {
    await pool.query('UPDATE Users SET userName=?, userEmail=?, userPhone=?, userRole=?, userPassword=? WHERE userId=?', [userName, userEmail, userPhone, userRole, userPassword, id])
    res.json({ ok: true })
  } catch (e) {
    console.error('[PUT /api/manage/users/:id]', e)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Delete user
router.delete('/users/:id', requireRole(['Admin'], pool), async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM Users WHERE userId=?', [id])
    res.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/manage/users/:id]', e)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Create event (Organizer/Admin)
router.post('/events', requireRole(['Organizer', 'Admin'], pool), async (req, res) => {
  const { title, category, eventDescription, startDate, duration, organizerId, venueId } = req.body
  if (!title || !category || !startDate || !duration || !organizerId || !venueId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const conn = await pool.getConnection()
  try {
    const [[maxE]] = await conn.query('SELECT IFNULL(MAX(eventId), 100) AS maxId FROM Event')
    const eventId = Number(maxE.maxId) + 1
    await conn.query(
      'INSERT INTO Event (eventId, title, category, eventDescription, startDate, duration, organizerId) VALUES (?,?,?,?,?,?,?)',
      [eventId, title, category, eventDescription || null, startDate, duration, organizerId]
    )
    await conn.query('INSERT INTO EventVenue (eventId, venueId) VALUES (?,?)', [eventId, venueId])
    res.status(201).json({ eventId })
  } catch (e) {
    console.error('[POST /api/manage/events]', e)
    res.status(500).json({ error: 'Failed to create event' })
  } finally {
    conn.release()
  }
})

// Update event
router.put('/events/:id', requireRole(['Organizer', 'Admin'], pool), async (req, res) => {
  const { id } = req.params
  const { title, category, eventDescription, startDate, duration, venueId } = req.body
  try {
    await pool.query(
      'UPDATE Event SET title=?, category=?, eventDescription=?, startDate=?, duration=? WHERE eventId=?',
      [title, category, eventDescription, startDate, duration, id]
    )
    if (venueId) {
      await pool.query('UPDATE EventVenue SET venueId=? WHERE eventId=?', [venueId, id])
    }
    res.json({ ok: true })
  } catch (e) {
    console.error('[PUT /api/manage/events/:id]', e)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// Delete event
router.delete('/events/:id', requireRole(['Organizer', 'Admin'], pool), async (req, res) => {
  const { id } = req.params
  const conn = await pool.getConnection()
  try {
    await conn.query('DELETE FROM EventVenue WHERE eventId=?', [id])
    await conn.query('DELETE FROM Ticket WHERE eventId=?', [id])
    await conn.query('DELETE FROM EventSponsor WHERE eventId=?', [id])
    await conn.query('DELETE FROM EventStaff WHERE eventId=?', [id])
    await conn.query('DELETE FROM Feedback WHERE eventId=?', [id])
    await conn.query('DELETE FROM Event WHERE eventId=?', [id])
    res.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/manage/events/:id]', e)
    res.status(500).json({ error: 'Failed to delete event' })
  } finally {
    conn.release()
  }
})

// Tickets CRUD for an event
router.post('/events/:id/tickets', requireRole(['Organizer', 'Admin'], pool), async (req, res) => {
  const { id } = req.params
  const { tCategory, price, availability } = req.body
  if (!tCategory || price == null || availability == null) return res.status(400).json({ error: 'Missing fields' })
  try {
    const [[maxT]] = await pool.query('SELECT IFNULL(MAX(ticketId), 300) AS maxId FROM Ticket')
    const ticketId = Number(maxT.maxId) + 1
    await pool.query('INSERT INTO Ticket (ticketId, eventId, tCategory, price, availability) VALUES (?,?,?,?,?)', [ticketId, id, tCategory, price, availability])
    res.status(201).json({ ticketId })
  } catch (e) {
    console.error('[POST /api/manage/events/:id/tickets]', e)
    res.status(500).json({ error: 'Failed to add ticket' })
  }
})

router.put('/tickets/:ticketId', requireRole(['Organizer', 'Admin'], pool), async (req, res) => {
  const { ticketId } = req.params
  const { tCategory, price, availability } = req.body
  try {
    await pool.query('UPDATE Ticket SET tCategory=?, price=?, availability=? WHERE ticketId=?', [tCategory, price, availability, ticketId])
    res.json({ ok: true })
  } catch (e) {
    console.error('[PUT /api/manage/tickets/:ticketId]', e)
    res.status(500).json({ error: 'Failed to update ticket' })
  }
})

router.delete('/tickets/:ticketId', requireRole(['Organizer', 'Admin'], pool), async (req, res) => {
  const { ticketId } = req.params
  try {
    await pool.query('DELETE FROM Ticket WHERE ticketId=?', [ticketId])
    res.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/manage/tickets/:ticketId]', e)
    res.status(500).json({ error: 'Failed to delete ticket' })
  }
})

module.exports = router

