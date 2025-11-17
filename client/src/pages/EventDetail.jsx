import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_URL } from '../App'

export default function EventDetail({ user }) {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [comments, setComments] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API_URL}/api/events/${id}`)
        if (!r.ok) throw new Error('Failed to load')
        const d = await r.json()
        setData(d)
      } catch (e) {
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const shareEvent = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: event?.title, text: event?.eventDescription, url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Event link copied to clipboard!')
    }
  }

  const addToCalendar = () => {
    if (!event) return
    const start = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const end = new Date(new Date(event.startDate).getTime() + event.duration * 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.eventDescription)}&location=${encodeURIComponent(event.venueAddress)}`
    window.open(url, '_blank')
  }

  const getDirections = () => {
    if (!event) return
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venueAddress)}`
    window.open(maps, '_blank')
  }

  const book = async (ticketId) => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/events/${id}` } })
      return
    }
    try {
      const r = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ticketId })
      })
      const d = await r.json()
  if (!r.ok) throw new Error(d.error || 'Booking failed')
  // show confirmation then navigate user to their bookings page
  alert(`Booked! #${d.bookingId} • ${d.title} (${d.ticketCategory})`)
  navigate('/bookings')
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return (
    <section className="section">
      <div className="detail-grid">
        <div className="panel">
          <div className="skeleton skeleton-line" style={{width:'40%',height:20}}/>
          <div className="skeleton skeleton-line" style={{width:'75%'}}/>
          <div className="skeleton skeleton-line" style={{width:'55%'}}/>
          <div className="grid" style={{marginTop:12}}>
            {Array.from({length:3}).map((_,i)=>(<div key={i} className="skeleton skeleton-card"/>))}
          </div>
        </div>
        <div className="panel">
          <div className="skeleton skeleton-line" style={{width:'60%'}}/>
          <div className="skeleton skeleton-line" style={{width:'80%'}}/>
          <div className="skeleton skeleton-line" style={{width:'70%'}}/>
        </div>
      </div>
    </section>
  )
  if (error) return <div className="section"><p className="muted">{error}</p></div>
  if (!data) return null

  const { event, tickets, sponsors, staff, feedback } = data

  const submitFeedback = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/login', { state: { redirectTo: `/events/${id}` } })
    try {
      const r = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId: Number(id), rating: Number(rating), comments })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      alert('Thanks for your feedback!')
      const rr = await fetch(`${API_URL}/api/events/${id}`)
      setData(await rr.json())
      setComments('')
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <section className="section">
      <div className="detail-grid">
        <div className="panel">
          <h2 style={{marginTop:0}}>{event.title}</h2>
          <p className="muted">{event.category} • {new Date(event.startDate).toLocaleString()} • {event.duration} hrs</p>
          <p className="muted">{event.venueName} — {event.venueAddress} (Capacity: {event.capacity})</p>
          <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
            <button className="btn btn-ghost" onClick={shareEvent}>Share</button>
            <button className="btn btn-ghost" onClick={addToCalendar}>Add to Calendar</button>
            <button className="btn btn-ghost" onClick={getDirections}>Get Directions</button>
          </div>
          <p style={{marginTop:12}}>{event.eventDescription}</p>

          <h3>Tickets</h3>
          <div className="grid">
            {tickets.map(t => (
              <article className="card" key={t.ticketId}>
                <div className="card-header"><h4 className="card-title">{t.category}</h4></div>
                <div className="card-body">Price: ₹{t.price} • Available: {t.availability}</div>
                <div className="card-footer">
                  <span />
                  <button className="btn btn-primary" onClick={() => book(t.ticketId)} disabled={t.availability <= 0}>
                    {t.availability > 0 ? 'Book' : 'Sold out'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Highlights</h3>
          <p className="muted">Sponsors</p>
          <ul>
            {sponsors.map(s => (
              <li key={s.sponsorId}>{s.sponsorName} — ₹{Number(s.contribution).toLocaleString()}</li>
            ))}
          </ul>
          <p className="muted" style={{marginTop:16}}>Staff</p>
          <ul>
            {staff.map(s => (
              <li key={s.staffId}>{s.staffName} — {s.staffRole} ({s.assignment})</li>
            ))}
          </ul>
          <p className="muted" style={{marginTop:16}}>Feedback</p>
          {feedback.length === 0 ? <p className="muted">No feedback yet.</p> : (
            <ul>
              {feedback.map((f, i) => (
                <li key={i}>⭐ {f.rating} — {f.userName}: {f.comments}</li>
              ))}
            </ul>
          )}
          <div style={{marginTop:12}}>
            <form onSubmit={submitFeedback}>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <select value={rating} onChange={e=>setRating(e.target.value)}>
                  {[1,2,3,4,5].map(n=>(<option key={n} value={n}>{n}</option>))}
                </select>
                <input placeholder="Share your thoughts" value={comments} onChange={e=>setComments(e.target.value)} />
                <button className="btn btn-ghost" type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
