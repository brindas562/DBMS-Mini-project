const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Simple demo login using plain passwords in seed data (not for production)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const [rows] = await pool.query(
      `SELECT userId, userName, userEmail, userRole FROM Users WHERE userEmail = ? AND userPassword = ?`,
      [email, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    res.cookie('token_uid', String(user.userId), { httpOnly: true, sameSite: 'lax' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token_uid');
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const uid = Number(req.cookies.token_uid);
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const [rows] = await pool.query(`SELECT userId, userName, userEmail, userRole FROM Users WHERE userId = ?`, [uid]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// Get total amount paid by user using function
router.get('/me/total-paid', requireAuth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const [rows] = await pool.query('SELECT GetTotalPaid(?) as totalPaid', [userId]);
    res.json({ totalPaid: rows[0].totalPaid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get total paid' });
  }
});

module.exports = router;
