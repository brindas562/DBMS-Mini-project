import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { API_URL } from '../App'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [sortBy, setSortBy] = useState('startDate')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const initialQ = params.get('q') || ''
    const initialCategory = params.get('category') || ''
    const initialPage = Number(params.get('page') || 1)
    setQ(initialQ)
    setCategory(initialCategory)
    setPage(initialPage)
  }, [location.search])

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (category) params.set('category', category)
        params.set('page', String(page))
        params.set('limit', '12')
        params.set('sort', sortBy)
        params.set('order', sortOrder)
        const res = await fetch(`${API_URL}/api/events?${params.toString()}`)
        const data = await res.json()
        if (!res.ok || !Array.isArray(data)) throw new Error(data?.error || 'Failed to load')
        setEvents(data)
        setHasMore(data.length === 12)
      } catch (e) {
        console.error(e)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    setLoading(true)
    load()
  }, [q, category, page, sortBy, sortOrder])

  return (
    <section className="section">
      <div style={{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
        <h2 style={{margin:0}}>All Events</h2>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <input placeholder="Search events" value={q} onChange={e=>{setPage(1);setQ(e.target.value)}} style={{minWidth:200}} />
          <select value={category} onChange={e=>{setPage(1);setCategory(e.target.value)}}>
            <option value="">All categories</option>
            <option>Concert</option>
            <option>Conference</option>
            <option>Exhibition</option>
            <option>Festival</option>
            <option>Business</option>
            <option>Movie</option>
            <option>Performance</option>
            <option>Competition</option>
            <option>Fundraiser</option>
          </select>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="startDate">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="category">Sort by Category</option>
          </select>
          <button className="btn btn-ghost" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="muted" style={{marginTop:16}}>Loading...</p>
      ) : events.length === 0 ? (
        <p className="muted" style={{marginTop:16}}>No events found.</p>
      ) : (
        <>
          <div className="grid" style={{marginTop:16}}>
            {events.map(ev => (
              <article className="card" key={ev.eventId}>
                <div className="card-header">
                  <h3 className="card-title">{ev.title}</h3>
                </div>
                <div className="card-meta">{new Date(ev.startDate).toLocaleString()} • {ev.venueName}</div>
                {ev.endDate && <div className="card-meta muted">Ends: {new Date(ev.endDate).toLocaleString()}</div>}
                <div className="card-body">{ev.eventDescription}</div>
                <div className="card-footer">
                  <div className="badges">
                    <span className="badge">{ev.category}</span>
                    <span className="badge" data-variant="accent">⭐ {ev.avgRating ?? 0}</span>
                    {ev.totalRevenue > 0 && <span className="badge" data-variant="success">₹{Number(ev.totalRevenue).toLocaleString()}</span>}
                  </div>
                  <Link className="btn btn-ghost" to={`/events/${ev.eventId}`}>View</Link>
                </div>
              </article>
            ))}
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'center',alignItems:'center',marginTop:20}}>
            <button className="btn btn-ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Previous</button>
            <span className="muted">Page {page}</span>
            <button className="btn btn-ghost" onClick={()=>setPage(p=>p+1)} disabled={!hasMore}>Next</button>
          </div>
        </>
      )}
    </section>
  )
}
