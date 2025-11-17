import { useEffect, useState } from 'react'
import { API_URL } from '../App'

export default function Venues() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API_URL}/api/venues`)
        if (!r.ok) throw new Error('Failed to load')
        const d = await r.json()
        setVenues(Array.isArray(d) ? d : [])
      } catch (e) {
        console.error(e)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = venues.filter(v => 
    !search || v.venueName?.toLowerCase().includes(search.toLowerCase()) ||
    v.venueAddress?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="section"><p className="muted">Loading venues...</p></div>

  return (
    <section className="section">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h2 style={{margin:0}}>Venues</h2>
        <input 
          placeholder="Search venues..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          style={{maxWidth:300}}
        />
      </div>

      <div className="grid">
        {filtered.map(v => (
          <article className="card" key={v.venueId}>
            <div className="card-header">
              <h3 className="card-title">{v.venueName}</h3>
            </div>
            <div className="card-body">
              <p><strong>Address:</strong> {v.venueAddress}</p>
              <p><strong>Capacity:</strong> {Number(v.capacity || 0).toLocaleString()}</p>
              <p><strong>Type:</strong> {v.venueType || 'N/A'}</p>
            </div>
            <div className="card-footer">
              <button className="btn btn-ghost" onClick={() => {
                const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.venueAddress)}`
                window.open(maps, '_blank')
              }}>
                View on Map
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && <p className="muted">No venues found.</p>}
    </section>
  )
}
