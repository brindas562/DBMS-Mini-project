import { useEffect, useState } from 'react'
import { API_URL } from '../App'

export default function Analytics({ user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API_URL}/api/analytics`, { credentials: 'include' })
        if (!r.ok) throw new Error('Failed to load')
        const d = await r.json()
        setData(d)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (!user || (user.userRole !== 'Organizer' && user.userRole !== 'Admin')) {
    return <div className="section"><p className="muted">Organizer/Admin access required.</p></div>
  }

  if (loading) return <div className="section"><p className="muted">Loading analytics...</p></div>
  if (!data) return <div className="section"><p className="muted">No data available.</p></div>

  const { totalRevenue, totalBookings, avgRating, topEvents, topVenues, recentBookings } = data

  return (
    <section className="section">
      <h2>Analytics Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">₹{Number(totalRevenue || 0).toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalBookings || 0}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgRating ? Number(avgRating).toFixed(2) : 'N/A'}</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="detail-grid" style={{marginTop: 24}}>
        <div className="panel">
          <h3>Top Events by Revenue</h3>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Revenue</th>
                <th>Bookings</th>
              </tr>
            </thead>
            <tbody>
              {topEvents?.map(e => (
                <tr key={e.eventId}>
                  <td>{e.title}</td>
                  <td>{e.category}</td>
                  <td>₹{Number(e.totalRevenue || 0).toLocaleString()}</td>
                  <td>{e.bookingCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h3>Top Venues</h3>
          <table>
            <thead>
              <tr>
                <th>Venue</th>
                <th>Events</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {topVenues?.map(v => (
                <tr key={v.venueId}>
                  <td>{v.venueName}</td>
                  <td>{v.eventCount || 0}</td>
                  <td>{Number(v.capacity || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{marginTop: 24}}>
        <h3>Recent Bookings</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Event</th>
              <th>Ticket</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings?.map(b => (
              <tr key={b.bookingId}>
                <td>{b.bookingId}</td>
                <td>{b.userName}</td>
                <td>{b.eventTitle}</td>
                <td>{b.ticketCategory}</td>
                <td>₹{Number(b.price || 0).toLocaleString()}</td>
                <td><span className={`badge ${b.bookingStatus === 'Cancelled' ? 'badge-error' : 'badge-success'}`}>{b.bookingStatus}</span></td>
                <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
