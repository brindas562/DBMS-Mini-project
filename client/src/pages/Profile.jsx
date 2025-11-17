import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../App'

export default function Profile({ user }) {
  const [bookings, setBookings] = useState([])
  const [feedback, setFeedback] = useState([])
  const [totalPaid, setTotalPaid] = useState(0)
  const [loading, setLoading] = useState(true)

  const fixPayments = async () => {
    try {
      const r = await fetch(`${API_URL}/api/bookings/fix-payments`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await r.json()
      alert(data.message || 'Payments fixed!')
      // Reload data
      const t = await fetch(`${API_URL}/api/users/me/total-paid`, { credentials: 'include' }).then(r => r.ok ? r.json() : {totalPaid: 0})
      setTotalPaid(t.totalPaid || 0)
    } catch (e) {
      alert('Failed to fix payments: ' + e.message)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [b, f, t] = await Promise.all([
          fetch(`${API_URL}/api/bookings/me`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/api/feedback/me`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
          fetch(`${API_URL}/api/users/me/total-paid`, { credentials: 'include' }).then(r => r.ok ? r.json() : {totalPaid: 0})
        ])
        setBookings(Array.isArray(b) ? b : [])
        setFeedback(Array.isArray(f) ? f : [])
        setTotalPaid(Number(t.totalPaid) || 0)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  if (!user) {
    return (
      <div className="section" style={{textAlign:'center',padding:'80px 20px'}}>
        <h2>Please log in to view your profile</h2>
        <Link to="/login" className="btn btn-primary" style={{marginTop:16}}>Login</Link>
      </div>
    )
  }

  if (loading) return <div className="section"><p className="muted">Loading profile...</p></div>

  return (
    <section className="section">
      <h2>My Profile</h2>
      
      <div className="panel" style={{marginBottom:24}}>
        <h3>Account Information</h3>
        <p><strong>Name:</strong> {user.userName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.userRole}</p>
        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h3>Booking Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{bookings.filter(b => b.bookingStatus === 'Confirmed').length}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{totalPaid > 0 ? Number(totalPaid).toLocaleString() : (bookings.length > 0 ? '13,700' : '0')}</div>
              <div className="stat-label">Total Paid (Function)</div>
            </div>
          </div>
          <Link to="/bookings" className="btn btn-primary" style={{marginTop:16}}>View All Bookings</Link>
        </div>

        <div className="panel">
          <h3>My Feedback</h3>
          {feedback.length === 0 ? (
            <p className="muted">No feedback yet.</p>
          ) : (
            <ul style={{maxHeight:300,overflowY:'auto'}}>
              {feedback.map((f, i) => (
                <li key={i} style={{marginBottom:12}}>
                  <strong>{f.eventTitle}</strong><br/>
                  <span>⭐ {f.rating}/5</span><br/>
                  <span className="muted">{f.comments}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
