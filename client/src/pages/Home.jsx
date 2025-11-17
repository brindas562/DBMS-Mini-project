import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../App'

export default function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/events?limit=6`)
        const data = await res.json()
        if (!res.ok || !Array.isArray(data)) throw new Error('Failed to load')
        setEvents(data)
      } catch (e) {
        console.error(e)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-wrap">
          <div>
            <h1 className="hero-title">EventHub</h1>
            <p className="hero-sub">Discover and book amazing events in your city</p>
            <div className="cta-row">
              <Link className="btn btn-primary" to="/events">Browse Events</Link>
              <Link className="btn btn-ghost" to="/login">Sign In</Link>
            </div>
          </div>
          <div className="hero-card">
            <h3>Quick Stats</h3>
            <div className="hero-meta">
              <span>500+ Events</span>
              <span>120K Bookings</span>
              <span>4.8★ Rating</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Featured Events</h2>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="grid">
            {events.map(e => (
              <article className="card" key={e.eventId}>
                <div className="card-header">
                  <h3 className="card-title">{e.title}</h3>
                </div>
                <div className="card-meta">{new Date(e.startDate).toLocaleDateString()} • {e.venueName}</div>
                <div className="card-body">{e.eventDescription}</div>
                <div className="card-footer">
                  <span className="badge">{e.category}</span>
                  <Link className="btn btn-ghost" to={`/events/${e.eventId}`}>View Details</Link>
                </div>
              </article>
            ))}
          </div>
        )}
        <div style={{textAlign:'center',marginTop:20}}>
          <Link className="btn btn-primary" to="/events">View All Events</Link>
        </div>
      </section>
    </>
  )
}
