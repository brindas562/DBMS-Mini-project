const express = require('express')
const { pool } = require('../db')
const { requireAuth } = require('../middleware/auth')
const router = express.Router()

// Execute custom SQL query (authenticated users) - limited to safe SELECT queries for frontend
router.post('/custom-query', requireAuth, async (req, res) => {

  const { query } = req.body
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' })
  }

  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return res.status(400).json({ error: 'Query cannot be empty' })
  }

  // Basic safety checks - prevent multiple queries and dangerous operations
  const lowerQuery = trimmedQuery.toLowerCase()
  
  // Check for multiple statements (simple check for semicolons not at end)
  const semicolonCount = (trimmedQuery.match(/;/g) || []).length
  const endsWithSemicolon = trimmedQuery.endsWith(';')
  if (semicolonCount > 1 || (semicolonCount === 1 && !endsWithSemicolon)) {
    return res.status(400).json({ error: 'Only one query can be executed at a time' })
  }

  // Only allow SELECT queries from the frontend editor to avoid DDL/DML risks in the demo
  if (!lowerQuery.startsWith('select')) {
    return res.status(403).json({ error: 'Only SELECT queries are allowed from the frontend SQL editor' })
  }

  try {
    const [rows] = await pool.query(trimmedQuery)
    
    // Check if it's a SELECT query (returns rows) or a modification query
    if (Array.isArray(rows) && rows.length > 0 && typeof rows[0] === 'object') {
      res.json({ 
        success: true, 
        results: rows,
        count: rows.length
      })
    } else if (rows.affectedRows !== undefined) {
      res.json({ 
        success: true, 
        message: `Query executed successfully. ${rows.affectedRows} row(s) affected.`,
        affectedRows: rows.affectedRows,
        insertId: rows.insertId || null
      })
    } else {
      res.json({ 
        success: true, 
        message: 'Query executed successfully',
        results: []
      })
    }
  } catch (e) {
    console.error('[POST /api/analytics/custom-query]', e)
    res.status(400).json({ 
      error: e.sqlMessage || e.message || 'Query execution failed'
    })
  }
})

module.exports = router
