const express = require('express');
const { pool } = require('../db');
const router = express.Router();

function getUserId(req) {
  const uid = Number(req.cookies.token_uid);
  return Number.isFinite(uid) ? uid : null;
}

// Create a booking for a ticket (one ticket per booking)
router.post('/bookings', async (req, res) => {
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ error: 'ticketId required' });
  try {
    // Basic availability check
    const [trows] = await pool.query(`SELECT availability, price FROM Ticket WHERE ticketId = ?`, [ticketId]);
    if (trows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    if (trows[0].availability <= 0) return res.status(400).json({ error: 'Sold out' });

    const ticketPrice = trows[0].price;

    // Generate next bookingId (follows seed pattern)
    const [[maxRow]] = await pool.query(`SELECT IFNULL(MAX(bookingId), 400) AS maxId FROM Booking`);
    const nextId = Number(maxRow.maxId) + 1;
    await pool.query(
      `INSERT INTO Booking (bookingId, userId, ticketId, bookingDate, bookingStatus)
       VALUES (?, ?, ?, CURDATE(), 'Confirmed')`,
      [nextId, uid, ticketId]
    );

    // Create payment record
    const [[maxPaymentRow]] = await pool.query(`SELECT IFNULL(MAX(paymentId), 500) AS maxId FROM Payment`);
    const nextPaymentId = Number(maxPaymentRow.maxId) + 1;
    await pool.query(
      `INSERT INTO Payment (paymentId, bookingId, amount, paymentDate, method, paymentStatus)
       VALUES (?, ?, ?, CURDATE(), 'UPI', 'Successful')`,
      [nextPaymentId, nextId, ticketPrice]
    );

    // Return booking with event details
    const [brows] = await pool.query(
      `SELECT b.bookingId, b.bookingDate, b.bookingStatus,
              e.title, t.tCategory as ticketCategory, t.price
       FROM Booking b
       JOIN Ticket t ON b.ticketId = t.ticketId
       JOIN Event e ON t.eventId = e.eventId
       WHERE b.bookingId = ?`,
      [nextId]
    );
    res.status(201).json(brows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// List current user's bookings
router.get('/bookings/me', async (req, res) => {
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const [rows] = await pool.query(
      `SELECT b.bookingId, b.bookingDate, b.bookingStatus,
              e.title, e.startDate, t.tCategory as ticketCategory, t.price
       FROM Booking b
       JOIN Ticket t ON b.ticketId = t.ticketId
       JOIN Event e ON t.eventId = e.eventId
       WHERE b.userId = ?
       ORDER BY b.bookingDate DESC`,
      [uid]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Cancel a booking (sets status to Cancelled)
router.post('/bookings/:id/cancel', async (req, res) => {
  const uid = getUserId(req)
  if (!uid) return res.status(401).json({ error: 'Not authenticated' })
  const { id } = req.params
  try {
    const [own] = await pool.query('SELECT bookingId FROM Booking WHERE bookingId=? AND userId=?', [id, uid])
    if (!own.length) return res.status(403).json({ error: 'Not your booking' })
    await pool.query('UPDATE Booking SET bookingStatus = "Cancelled" WHERE bookingId=?', [id])
    res.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/bookings/:id/cancel]', e)
    res.status(500).json({ error: 'Failed to cancel booking' })
  }
})

// Fix missing payments for existing bookings
router.post('/bookings/fix-payments', async (req, res) => {
  const uid = getUserId(req)
  if (!uid) return res.status(401).json({ error: 'Not authenticated' })
  try {
    // Get bookings without payments
    const [bookingsWithoutPayment] = await pool.query(`
      SELECT b.bookingId, t.price, b.bookingDate
      FROM Booking b
      JOIN Ticket t ON b.ticketId = t.ticketId
      WHERE b.bookingId NOT IN (SELECT bookingId FROM Payment)
    `)
    
    if (bookingsWithoutPayment.length === 0) {
      return res.json({ message: 'All bookings already have payments', count: 0 })
    }

    // Get max payment ID
    const [[maxPaymentRow]] = await pool.query(`SELECT IFNULL(MAX(paymentId), 500) AS maxId FROM Payment`)
    let nextPaymentId = Number(maxPaymentRow.maxId) + 1

    // Insert payments for each booking
    for (const booking of bookingsWithoutPayment) {
      await pool.query(
        `INSERT INTO Payment (paymentId, bookingId, amount, paymentDate, method, paymentStatus)
         VALUES (?, ?, ?, ?, 'UPI', 'Successful')`,
        [nextPaymentId, booking.bookingId, booking.price, booking.bookingDate]
      )
      nextPaymentId++
    }

    res.json({ message: 'Payments created successfully', count: bookingsWithoutPayment.length })
  } catch (e) {
    console.error('[POST /api/bookings/fix-payments]', e)
    res.status(500).json({ error: 'Failed to fix payments' })
  }
})

module.exports = router;
