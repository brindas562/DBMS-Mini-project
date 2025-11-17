import { useEffect, useState } from 'react'
import { API_URL } from '../App'

export default function MyBookings({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API_URL}/api/bookings/me`, { credentials: 'include' })
        if (r.status === 401) {
          setItems([])
        } else {
          setItems(await r.json())
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const exportBookings = () => {
    const csv = [
      ['Booking ID', 'Event', 'Event Date', 'Booked On', 'Ticket', 'Price', 'Status'].join(','),
      ...items.map(b => [
        b.bookingId,
        `"${b.title}"`,
        new Date(b.startDate).toLocaleDateString(),
        b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'N/A',
        b.ticketCategory,
        b.price,
        b.bookingStatus
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const cancelBooking = async (bookingId) => {
    try {
      const r = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, { method: 'POST', credentials: 'include' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed to cancel')
      setItems(items => items.map(b => b.bookingId === bookingId ? { ...b, bookingStatus: 'Cancelled' } : b))
    } catch (e) {
      alert(e.message)
    }
  }

  if (!user) return <div className="section"><p className="muted">Please login to view your bookings.</p></div>
  if (loading) return <div className="section"><p className="muted">Loading…</p></div>

  return (
    <section className="section">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h2 style={{margin:0}}>My Bookings</h2>
        {items.length > 0 && (
          <button className="btn btn-primary" onClick={exportBookings}>Export CSV</button>
        )}
      </div>
      {items.length === 0 ? <p className="muted">No bookings yet.</p> : (
        <div className="panel" style={{padding:0,overflow:'hidden'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead style={{background:'rgba(255,255,255,.04)'}}>
                <tr>
                  <th style={{textAlign:'left',padding:12}}>#</th>
                  <th style={{textAlign:'left',padding:12}}>Event</th>
                  <th style={{textAlign:'left',padding:12}}>Event Date</th>
                  <th style={{textAlign:'left',padding:12}}>Booked On</th>
                  <th style={{textAlign:'left',padding:12}}>Ticket</th>
                  <th style={{textAlign:'left',padding:12}}>Price</th>
                  <th style={{textAlign:'left',padding:12}}>Status</th>
                  <th style={{textAlign:'left',padding:12}}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(b => (
                  <tr key={b.bookingId} style={{borderTop:'1px solid var(--ring)'}}>
                    <td style={{padding:12}}>{b.bookingId}</td>
                    <td style={{padding:12}}>{b.title}</td>
                    <td style={{padding:12}}>{new Date(b.startDate).toLocaleString()}</td>
                    <td style={{padding:12}}>
                      <span className="muted" style={{fontSize:13}}>
                        {b.bookingDate ? new Date(b.bookingDate).toLocaleString() : 'N/A'}
                      </span>
                    </td>
                    <td style={{padding:12}}>{b.ticketCategory}</td>
                    <td style={{padding:12}}>₹{b.price}</td>
                    <td style={{padding:12}}>
                      <span className="badge" style={{background: b.bookingStatus==='Cancelled' ? 'rgba(255,80,80,.18)' : 'rgba(80,255,160,.12)', borderColor:'var(--ring)'}}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td style={{padding:12}}>
                      <button className="btn btn-ghost" disabled={b.bookingStatus !== 'Confirmed'} onClick={()=>cancelBooking(b.bookingId)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
