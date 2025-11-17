const express = require('express')
const { pool } = require('../db')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT venueId, venueName, venueAddress, capacity, contactInfo FROM Venue ORDER BY venueName ASC')
    res.json(rows)
  } catch (e) {
    console.error('[GET /api/venues]', e)
    res.status(500).json({ error: 'Failed to load venues' })
  }
})

module.exports = router
