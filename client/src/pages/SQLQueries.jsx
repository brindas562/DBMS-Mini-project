import { useState } from 'react'
import { API_URL } from '../App'

export default function SQLQueries({ user }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showExamples, setShowExamples] = useState(true)

  const examples = [
    {
      title: 'View All Events',
      query: 'SELECT * FROM Event LIMIT 10;'
    },
    {
      title: 'Total Revenue by Category',
      query: `SELECT 
  e.category,
  COUNT(e.eventId) as Total_Events,
  COALESCE(SUM(p.amount), 0) as Total_Revenue
FROM Event e
LEFT JOIN Ticket t ON e.eventId = t.eventId
LEFT JOIN Booking b ON t.ticketId = b.ticketId
LEFT JOIN Payment p ON b.bookingId = p.bookingId AND p.paymentStatus = 'Successful'
GROUP BY e.category
ORDER BY Total_Revenue DESC;`
    },
    {
      title: 'Top 5 Events by Bookings',
      query: `SELECT 
  e.title,
  e.category,
  COUNT(b.bookingId) as Booking_Count,
  SUM(p.amount) as Revenue
FROM Event e
LEFT JOIN Ticket t ON e.eventId = t.eventId
LEFT JOIN Booking b ON t.ticketId = b.ticketId
LEFT JOIN Payment p ON b.bookingId = p.bookingId AND p.paymentStatus = 'Successful'
GROUP BY e.eventId
ORDER BY Booking_Count DESC
LIMIT 5;`
    },
    {
      title: 'Users with Most Bookings',
      query: `SELECT 
  u.userName,
  u.userEmail,
  COUNT(b.bookingId) as Total_Bookings,
  SUM(p.amount) as Total_Spent
FROM Users u
JOIN Booking b ON u.userId = b.userId
LEFT JOIN Payment p ON b.bookingId = p.bookingId
GROUP BY u.userId
ORDER BY Total_Bookings DESC
LIMIT 10;`
    },
    {
      title: 'Venue Utilization',
      query: `SELECT 
  v.venueName,
  v.capacity,
  COUNT(ev.eventId) as Events_Hosted
FROM Venue v
LEFT JOIN EventVenue ev ON v.venueId = ev.venueId
GROUP BY v.venueId
ORDER BY Events_Hosted DESC;`
    },
    {
      title: 'Average Rating by Category',
      query: `SELECT 
  e.category,
  COUNT(f.userId) as Feedback_Count,
  ROUND(AVG(f.rating), 2) as Avg_Rating
FROM Event e
LEFT JOIN Feedback f ON e.eventId = f.eventId
GROUP BY e.category
ORDER BY Avg_Rating DESC;`
    },
    {
      title: 'Recent Bookings with Details',
      query: `SELECT 
  b.bookingId,
  u.userName,
  e.title as Event,
  t.tCategory as Ticket,
  b.bookingDate,
  b.bookingStatus,
  p.amount
FROM Booking b
JOIN Users u ON b.userId = u.userId
JOIN Ticket t ON b.ticketId = t.ticketId
JOIN Event e ON t.eventId = e.eventId
LEFT JOIN Payment p ON b.bookingId = p.bookingId
ORDER BY b.bookingDate DESC
LIMIT 20;`
    },
    {
      title: 'Sponsor Contributions Summary',
      query: `SELECT 
  s.sponsorName,
  COUNT(es.eventId) as Events_Sponsored,
  SUM(s.contribution) as Total_Contribution
FROM Sponsor s
LEFT JOIN EventSponsor es ON s.sponsorId = es.sponsorId
GROUP BY s.sponsorId
ORDER BY Total_Contribution DESC;`
    },
    {
      title: '🔧 Function: Average Rating',
      query: `SELECT 
  e.title,
  GetAverageRating(e.eventId) as Avg_Rating
FROM Event e
ORDER BY Avg_Rating DESC
LIMIT 10;`
    },
    {
      title: '🔧 Function: Event End Date',
      query: `SELECT 
  title,
  startDate,
  duration,
  GetEventEndDate(startDate, duration) as End_Date
FROM Event
LIMIT 10;`
    },
    {
      title: '🔧 Function: Total User Payment',
      query: `SELECT 
  userName,
  GetTotalPaid(userId) as Total_Paid
FROM Users
ORDER BY Total_Paid DESC
LIMIT 10;`
    },
    {
      title: '⚙️ Procedure: Events by Category',
      query: `CALL GetEventsByCategory('Conference');`
    },
    {
      title: '⚙️ Procedure: Event Revenue',
      query: `CALL EventRevenueSummary(101);`
    },
    {
      title: '👁️ View: High Rated Events',
      query: `SELECT * FROM HighRatedEvents
ORDER BY avg_rating DESC;`
    }
  ]

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const r = await fetch(`${API_URL}/api/analytics/custom-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: query.trim() })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Query failed')
      setResult(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadExample = (exampleQuery) => {
    setQuery(exampleQuery)
    setShowExamples(false)
  }

  if (!user) {
    return <div className="section"><p className="muted">Please log in to use the SQL Query tool.</p></div>
  }

  return (
    <section className="section">
      <h2>Custom SQL Query</h2>
      <p className="muted">Execute your own SQL queries on the database</p>

      <div className="panel" style={{marginBottom:24,background:'#e8f4ff',borderColor:'#0a84ff'}}>
        <h3 style={{marginTop:0,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:20}}>💡</span> Query Tips:
        </h3>
        <ul style={{margin:0,paddingLeft:20}}>
          <li>Use SELECT to query data, INSERT/UPDATE/DELETE to modify data</li>
          <li>End your query with a semicolon (;)</li>
          <li>Only one query can be executed at a time</li>
          <li>Available tables: Event, Ticket, Booking, Payment, Users, Venue, Feedback, Sponsor, Staff, etc.</li>
          <li><strong>Functions:</strong> GetAverageRating(eventId), GetTotalPaid(userId), GetEventEndDate(startDate, duration)</li>
          <li><strong>Procedures:</strong> CALL GetEventsByCategory('category'), CALL EventRevenueSummary(eventId)</li>
          <li><strong>View:</strong> SELECT * FROM HighRatedEvents</li>
        </ul>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24,marginBottom:24}}>
        <div className="panel">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h3 style={{margin:0}}>SQL Query Editor</h3>
            <button className="btn btn-ghost" onClick={() => setQuery('')}>Clear</button>
          </div>
          <textarea
            placeholder="Enter your SQL query here...
Example: SELECT * FROM Event LIMIT 10;"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width:'100%',
              minHeight:200,
              fontFamily:'monospace',
              fontSize:14,
              padding:12,
              borderRadius:8,
              border:'1px solid var(--ring)',
              resize:'vertical'
            }}
          />
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button 
              className="btn btn-primary" 
              onClick={executeQuery} 
              disabled={loading || !query.trim()}
            >
              {loading ? 'Executing...' : '▶ Execute Query'}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowExamples(!showExamples)}>
              {showExamples ? 'Hide Examples' : 'Show Examples'}
            </button>
          </div>
        </div>

        {showExamples && (
          <div className="panel">
            <h3 style={{marginTop:0}}>Sample Queries</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12,maxHeight:400,overflowY:'auto'}}>
              {examples.map((ex, i) => (
                <div key={i} style={{padding:12,border:'1px solid var(--ring)',borderRadius:8,cursor:'pointer'}} onClick={() => loadExample(ex.query)}>
                  <strong style={{display:'block',marginBottom:4}}>{ex.title}</strong>
                  <code style={{fontSize:11,color:'var(--muted)',display:'block',whiteSpace:'pre-wrap'}}>{ex.query.substring(0, 80)}...</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="panel" style={{background:'#fff5f5',borderColor:'#dc2626',marginBottom:24}}>
          <h3 style={{marginTop:0,color:'#dc2626'}}>Error</h3>
          <p style={{margin:0,fontFamily:'monospace',fontSize:14}}>{error}</p>
        </div>
      )}

      {result && (
        <div className="panel">
          <h3 style={{marginTop:0}}>Query Results</h3>
          {result.results && result.results.length > 0 ? (
            <>
              <p className="muted">Returned {result.results.length} row(s)</p>
              <div style={{overflowX:'auto'}}>
                <table>
                  <thead>
                    <tr>
                      {Object.keys(result.results[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{val !== null ? String(val) : 'NULL'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : result.message ? (
            <p style={{color:'#059669',fontWeight:600}}>{result.message}</p>
          ) : (
            <p className="muted">Query executed successfully (no results returned)</p>
          )}
        </div>
      )}
    </section>
  )
}
