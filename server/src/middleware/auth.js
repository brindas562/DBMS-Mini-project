function getUserFromCookies(req) {
  const uid = Number(req.cookies.token_uid)
  if (!Number.isFinite(uid)) return null
  return { userId: uid }
}

function requireAuth(req, res, next) {
  const user = getUserFromCookies(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  req.user = user
  next()
}

function requireRole(roles, pool) {
  const set = new Set(Array.isArray(roles) ? roles : [roles])
  return async (req, res, next) => {
    const user = getUserFromCookies(req)
    if (!user) return res.status(401).json({ error: 'Not authenticated' })
    try {
      const [rows] = await pool.query('SELECT userId, userRole FROM Users WHERE userId = ?', [user.userId])
      if (!rows.length) return res.status(401).json({ error: 'User not found' })
      if (!set.has(rows[0].userRole)) return res.status(403).json({ error: 'Forbidden' })
      req.user = rows[0]
      next()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = { requireAuth, requireRole }
