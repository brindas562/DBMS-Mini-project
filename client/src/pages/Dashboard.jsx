import { useEffect, useState } from 'react'
import { API_URL } from '../App'

export default function Dashboard({ user }) {
  const [events, setEvents] = useState([])
  const [venues, setVenues] = useState([])
  const [form, setForm] = useState({ title:'', category:'Conference', eventDescription:'', startDate:'', duration:1, venueId:'' })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [ticketForm, setTicketForm] = useState({ category:'General', price:0, availability:100 })
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [sponsorForm, setSponsorForm] = useState({ sponsorName:'', contribution:0 })
  const [showSponsorForm, setShowSponsorForm] = useState(false)
  const [staffForm, setStaffForm] = useState({ staffName:'', staffRole:'', assignment:'' })
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [eventDetails, setEventDetails] = useState(null)
  const [viewingEvent, setViewingEvent] = useState(null)

  useEffect(() => {
    async function load() {
      const [ev, vn] = await Promise.all([
        fetch(`${API_URL}/api/events`).then(r=>r.json()).catch(()=>[]),
        fetch(`${API_URL}/api/venues`).then(r=>r.json()).catch(()=>[])
      ])
      setEvents(Array.isArray(ev)?ev:[])
      setVenues(Array.isArray(vn)?vn:[])
    }
    load()
  }, [])

  const createSponsor = async (e) => {
    e.preventDefault()
    if (!selectedEvent) return
    try {
      const payload = { sponsorName: sponsorForm.sponsorName, contribution: Number(sponsorForm.contribution) }
      const r = await fetch(`${API_URL}/api/manage/sponsors`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      const sponsorId = d.sponsorId
      const r2 = await fetch(`${API_URL}/api/manage/event-sponsors`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ eventId: selectedEvent, sponsorId }) })
      if (!r2.ok) throw new Error('Failed to link sponsor')
      alert('Sponsor added')
      setShowSponsorForm(false)
      setSponsorForm({ sponsorName:'', contribution:0 })
      loadEventDetails(selectedEvent)
    } catch (e) {
      alert(e.message)
    }
  }

  const createStaff = async (e) => {
    e.preventDefault()
    if (!selectedEvent) return
    try {
      const payload = { staffName: staffForm.staffName, staffRole: staffForm.staffRole }
      const r = await fetch(`${API_URL}/api/manage/staff`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      const staffId = d.staffId
      const r2 = await fetch(`${API_URL}/api/manage/event-staff`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ eventId: selectedEvent, staffId, assignment: staffForm.assignment }) })
      if (!r2.ok) throw new Error('Failed to link staff')
      alert('Staff added')
      setShowStaffForm(false)
      setStaffForm({ staffName:'', staffRole:'', assignment:'' })
      loadEventDetails(selectedEvent)
    } catch (e) {
      alert(e.message)
    }
  }

  const loadEventDetails = async (eventId) => {
    try {
      const r = await fetch(`${API_URL}/api/events/${eventId}`)
      const d = await r.json()
      if (r.ok) {
        setEventDetails(d)
        setViewingEvent(eventId)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      const r = await fetch(`${API_URL}/api/manage/events/${eventId}`, { method: 'DELETE', credentials: 'include' })
      if (!r.ok) throw new Error('Failed to delete')
      alert('Event deleted')
      setEvents(events.filter(e => e.eventId !== eventId))
      setViewingEvent(null)
      setEventDetails(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const createTicket = async (e) => {
    e.preventDefault()
    if (!selectedEvent) return
    try {
      const payload = { ...ticketForm, eventId: selectedEvent, price: Number(ticketForm.price), availability: Number(ticketForm.availability) }
      const r = await fetch(`${API_URL}/api/manage/tickets`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      alert('Ticket created')
      setShowTicketForm(false)
      setTicketForm({ category:'General', price:0, availability:100 })
    } catch (e) {
      alert(e.message)
    }
  }

  const createEvent = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, organizerId: user.userId, duration: Number(form.duration), venueId: Number(form.venueId) }
      const r = await fetch(`${API_URL}/api/manage/events`, { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to create')
      alert('Event created successfully!')
      setForm({ title:'', category:'Conference', eventDescription:'', startDate:'', duration:1, venueId:'' })
      setShowEventForm(false)
      const [ev] = await Promise.all([fetch(`${API_URL}/api/events`).then(r=>r.json()).catch(()=>[])])
      setEvents(Array.isArray(ev)?ev:[])
    } catch (e) {
      alert(e.message)
    }
  }

  if (!user || (user.userRole !== 'Organizer' && user.userRole !== 'Admin')) {
    return <div className="section"><p className="muted">Organizer/Admin access required.</p></div>
  }

  const myEvents = events.filter(e => e.organizerId === user.userId)

  return (
    <section className="section">
      <h2>Organizer Dashboard</h2>
      
      <div className="stats-grid" style={{marginBottom:24}}>
        <div className="stat-card">
          <div className="stat-value">{myEvents.length}</div>
          <div className="stat-label">My Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">₹{myEvents.reduce((sum, e) => sum + Number(e.totalRevenue || 0), 0).toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{(myEvents.reduce((sum, e, i, arr) => sum + Number(e.avgRating || 0), 0) / myEvents.length || 0).toFixed(1)}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      <button className="btn btn-primary" style={{marginBottom:24}} onClick={() => setShowEventForm(!showEventForm)}>
        {showEventForm ? 'Hide' : 'Create New Event'}
      </button>

      {showEventForm && (
        <div className="panel" style={{marginBottom:24}}>
          <h3>Create Event</h3>
          <form onSubmit={createEvent}>
            <div style={{display:'grid',gap:8}}>
              <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                <option>Concert</option><option>Conference</option><option>Exhibition</option><option>Festival</option><option>Business</option><option>Movie</option><option>Performance</option><option>Competition</option><option>Fundraiser</option>
              </select>
              <textarea placeholder="Description" value={form.eventDescription} onChange={e=>setForm({...form,eventDescription:e.target.value})} rows="3" />
              <input type="datetime-local" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} required />
              <input type="number" min="1" placeholder="Duration (hours)" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} />
              <select value={form.venueId} onChange={e=>setForm({...form,venueId:e.target.value})} required>
                <option value="">Select venue</option>
                {venues.map(v=> <option key={v.venueId} value={v.venueId}>{v.venueName}</option>)}
              </select>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-primary" type="submit">Create Event</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShowEventForm(false)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="detail-grid">
        <div className="panel">
          <h3>Your Events</h3>
          {myEvents.length === 0 ? (
            <p className="muted">No events yet. Create your first event!</p>
          ) : (
            <div className="grid">
              {myEvents.map(e => (
                <div key={e.eventId} className="card">
                  <div className="card-header">
                    <h4 className="card-title">{e.title}</h4>
                  </div>
                  <div className="card-body">
                    <p className="muted">{new Date(e.startDate).toLocaleString()}</p>
                    <p><strong>{e.category}</strong></p>
                    <p>Revenue: ₹{Number(e.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="card-footer" style={{flexDirection:'column',gap:8,alignItems:'stretch'}}>
                    <button className="btn btn-primary" onClick={() => {setSelectedEvent(e.eventId);loadEventDetails(e.eventId)}}>Manage</button>
                    <button className="btn btn-ghost" onClick={() => deleteEvent(e.eventId)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {viewingEvent && eventDetails && (
          <div className="panel">
            <h3>Manage: {eventDetails.event.title}</h3>
            
            <div style={{marginBottom:16}}>
              <h4>Tickets</h4>
              {eventDetails.tickets.length === 0 ? (
                <p className="muted">No tickets yet.</p>
              ) : (
                <ul>
                  {eventDetails.tickets.map(t => (
                    <li key={t.ticketId}>{t.category} - ₹{t.price} (Available: {t.availability})</li>
                  ))}
                </ul>
              )}
              <button className="btn btn-ghost" onClick={() => setShowTicketForm(!showTicketForm)}>Add Ticket</button>
              {showTicketForm && (
                <form onSubmit={createTicket} style={{marginTop:12,padding:12,border:'1px solid var(--ring)',borderRadius:8}}>
                  <input placeholder="Category" value={ticketForm.category} onChange={e=>setTicketForm({...ticketForm,category:e.target.value})} required />
                  <input type="number" min="0" placeholder="Price" value={ticketForm.price} onChange={e=>setTicketForm({...ticketForm,price:e.target.value})} required />
                  <input type="number" min="1" placeholder="Availability" value={ticketForm.availability} onChange={e=>setTicketForm({...ticketForm,availability:e.target.value})} required />
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="btn btn-primary" type="submit">Add</button>
                    <button className="btn btn-ghost" type="button" onClick={()=>setShowTicketForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>

            <div style={{marginBottom:16}}>
              <h4>Sponsors</h4>
              {eventDetails.sponsors.length === 0 ? (
                <p className="muted">No sponsors yet.</p>
              ) : (
                <ul>
                  {eventDetails.sponsors.map(s => (
                    <li key={s.sponsorId}>{s.sponsorName} - ₹{Number(s.contribution).toLocaleString()}</li>
                  ))}
                </ul>
              )}
              <button className="btn btn-ghost" onClick={() => setShowSponsorForm(!showSponsorForm)}>Add Sponsor</button>
              {showSponsorForm && (
                <form onSubmit={createSponsor} style={{marginTop:12,padding:12,border:'1px solid var(--ring)',borderRadius:8}}>
                  <input placeholder="Sponsor Name" value={sponsorForm.sponsorName} onChange={e=>setSponsorForm({...sponsorForm,sponsorName:e.target.value})} required />
                  <input type="number" min="0" placeholder="Contribution" value={sponsorForm.contribution} onChange={e=>setSponsorForm({...sponsorForm,contribution:e.target.value})} required />
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="btn btn-primary" type="submit">Add</button>
                    <button className="btn btn-ghost" type="button" onClick={()=>setShowSponsorForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>

            <div style={{marginBottom:16}}>
              <h4>Staff</h4>
              {eventDetails.staff.length === 0 ? (
                <p className="muted">No staff yet.</p>
              ) : (
                <ul>
                  {eventDetails.staff.map(s => (
                    <li key={s.staffId}>{s.staffName} - {s.staffRole} ({s.assignment})</li>
                  ))}
                </ul>
              )}
              <button className="btn btn-ghost" onClick={() => setShowStaffForm(!showStaffForm)}>Add Staff</button>
              {showStaffForm && (
                <form onSubmit={createStaff} style={{marginTop:12,padding:12,border:'1px solid var(--ring)',borderRadius:8}}>
                  <input placeholder="Staff Name" value={staffForm.staffName} onChange={e=>setStaffForm({...staffForm,staffName:e.target.value})} required />
                  <input placeholder="Role" value={staffForm.staffRole} onChange={e=>setStaffForm({...staffForm,staffRole:e.target.value})} required />
                  <input placeholder="Assignment" value={staffForm.assignment} onChange={e=>setStaffForm({...staffForm,assignment:e.target.value})} required />
                  <div style={{display:'flex',gap:8,marginTop:8}}>
                    <button className="btn btn-primary" type="submit">Add</button>
                    <button className="btn btn-ghost" type="button" onClick={()=>setStaffForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
