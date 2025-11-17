import { useState } from 'react'

export default function DatabaseObjects() {
  const [activeTab, setActiveTab] = useState('triggers')

  const triggers = [
    {
      name: 'reduce_ticket_availability',
      type: 'AFTER INSERT ON Booking',
      purpose: 'Automatically reduces ticket availability when a booking is created',
      code: `CREATE TRIGGER reduce_ticket_availability
AFTER INSERT ON Booking
FOR EACH ROW
BEGIN
    UPDATE Ticket
    SET availability = availability - 1
    WHERE ticketId = NEW.ticketId;
END`,
      demo: 'When you book a ticket in "My Bookings" page, this trigger automatically decreases the available ticket count.'
    },
    {
      name: 'set_payment_status',
      type: 'BEFORE INSERT ON Payment',
      purpose: 'Automatically sets payment status based on amount',
      code: `CREATE TRIGGER set_payment_status
BEFORE INSERT ON Payment
FOR EACH ROW
BEGIN
    IF NEW.amount > 0 THEN
        SET NEW.paymentStatus = 'Successful';
    ELSE
        SET NEW.paymentStatus = 'Failed';
    END IF;
END`,
      demo: 'When a payment is created, this trigger automatically sets the status to "Successful" if amount > 0, otherwise "Failed".'
    },
    {
      name: 'log_booking_status_change',
      type: 'AFTER UPDATE ON Booking',
      purpose: 'Logs booking status changes to BookingLog table for audit trail',
      code: `CREATE TRIGGER log_booking_status_change
AFTER UPDATE ON Booking
FOR EACH ROW
BEGIN
    IF OLD.bookingStatus <> NEW.bookingStatus THEN
        INSERT INTO BookingLog (bookingId, oldStatus, newStatus)
        VALUES (NEW.bookingId, OLD.bookingStatus, NEW.bookingStatus);
    END IF;
END`,
      demo: 'When you update a booking status (e.g., Confirmed → Cancelled), this trigger logs the change in BookingLog table.'
    }
  ]

  const procedures = [
    {
      name: 'GetEventsByCategory',
      parameters: 'IN p_category VARCHAR(50)',
      purpose: 'Retrieves all events for a specific category with venue details',
      code: `CREATE PROCEDURE GetEventsByCategory(IN p_category VARCHAR(50))
BEGIN
    SELECT e.eventId, e.title, e.startDate, v.venueName
    FROM Event e
    JOIN EventVenue ev ON e.eventId = ev.eventId
    JOIN Venue v ON ev.venueId = v.venueId
    WHERE e.category = p_category;
END`,
      usage: `CALL GetEventsByCategory('Conference');`,
      demo: 'Used in Events page filtering. Also available in SQL Queries page with custom categories.'
    },
    {
      name: 'EventRevenueSummary',
      parameters: 'IN p_eventId INT',
      purpose: 'Calculates total revenue and tickets sold for a specific event',
      code: `CREATE PROCEDURE EventRevenueSummary(IN p_eventId INT)
BEGIN
    SELECT 
        e.title,
        COUNT(b.bookingId) AS total_tickets_sold,
        SUM(p.amount) AS total_revenue
    FROM Event e
    JOIN Ticket t ON e.eventId = t.eventId
    JOIN Booking b ON t.ticketId = b.ticketId
    JOIN Payment p ON b.bookingId = p.bookingId
    WHERE e.eventId = p_eventId
      AND p.paymentStatus = 'Successful'
    GROUP BY e.eventId, e.title;
END`,
      usage: `CALL EventRevenueSummary(101);`,
      demo: 'Can be accessed via API endpoint: /api/events/:id/revenue (requires authentication).'
    }
  ]

  const functions = [
    {
      name: 'GetAverageRating',
      parameters: 'p_eventId INT',
      returns: 'DECIMAL(3,2)',
      purpose: 'Calculates and returns the average rating for an event',
      code: `CREATE FUNCTION GetAverageRating(p_eventId INT)
RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
    DECLARE avgRating DECIMAL(3,2);
    SELECT IFNULL(AVG(rating), 0)
    INTO avgRating
    FROM Feedback
    WHERE eventId = p_eventId;
    RETURN avgRating;
END`,
      usage: `SELECT title, GetAverageRating(eventId) AS avg_rating FROM Event;`,
      demo: 'Used in Events page - the star rating (⭐) next to each event is calculated using this function.'
    },
    {
      name: 'GetEventEndDate',
      parameters: 'startDate DATETIME, duration INT',
      returns: 'DATETIME',
      purpose: 'Calculates event end date/time based on start date and duration in hours',
      code: `CREATE FUNCTION GetEventEndDate(startDate DATETIME, duration INT)
RETURNS DATETIME
DETERMINISTIC
RETURN DATE_ADD(startDate, INTERVAL duration HOUR);`,
      usage: `SELECT title, GetEventEndDate(startDate, duration) AS endDate FROM Event;`,
      demo: 'Used in Events page - shows "Ends: [date/time]" below each event card.'
    },
    {
      name: 'GetTotalPaid',
      parameters: 'userId INT',
      returns: 'DECIMAL(12,2)',
      purpose: 'Calculates total amount paid by a user across all successful payments',
      code: `CREATE FUNCTION GetTotalPaid(userId INT)
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(12,2);
    SELECT IFNULL(SUM(p.amount), 0)
    INTO total
    FROM Payment p
    JOIN Booking b ON p.bookingId = b.bookingId
    WHERE b.userId = userId AND p.paymentStatus = 'Successful';
    RETURN total;
END`,
      usage: `SELECT userName, GetTotalPaid(userId) AS total_paid FROM Users;`,
      demo: 'Used in Profile page - displays "Total Paid (Function)" in the Booking Summary section.'
    }
  ]

  const views = [
    {
      name: 'HighRatedEvents',
      purpose: 'Virtual table showing events with average rating >= 4, along with feedback count and revenue',
      code: `CREATE VIEW HighRatedEvents AS
SELECT 
    e.eventId,
    e.title,
    ROUND(AVG(f.rating), 2) AS avg_rating,
    COUNT(f.userId) AS total_feedbacks,
    IFNULL(SUM(p.amount), 0) AS total_revenue
FROM Event e
LEFT JOIN Feedback f ON e.eventId = f.eventId
LEFT JOIN Ticket t ON e.eventId = t.eventId
LEFT JOIN Booking b ON t.ticketId = b.ticketId
LEFT JOIN Payment p ON b.bookingId = p.bookingId AND p.paymentStatus = 'Successful'
GROUP BY e.eventId, e.title
HAVING avg_rating >= 4;`,
      usage: `SELECT * FROM HighRatedEvents ORDER BY avg_rating DESC;`,
      demo: 'Used in Analytics page to display top-performing events. Try it in SQL Queries page!'
    }
  ]

  return (
    <section className="section">
      <h2>Database Objects Documentation</h2>
      <p className="muted">Explore triggers, stored procedures, functions, and views used in this application</p>

      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        <button 
          className={`btn ${activeTab === 'triggers' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('triggers')}
        >
          🔔 Triggers ({triggers.length})
        </button>
        <button 
          className={`btn ${activeTab === 'procedures' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('procedures')}
        >
          ⚙️ Procedures ({procedures.length})
        </button>
        <button 
          className={`btn ${activeTab === 'functions' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('functions')}
        >
          🔧 Functions ({functions.length})
        </button>
        <button 
          className={`btn ${activeTab === 'views' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('views')}
        >
          👁️ Views ({views.length})
        </button>
      </div>

      {activeTab === 'triggers' && (
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          {triggers.map((trigger, i) => (
            <div key={i} className="panel">
              <h3 style={{marginTop:0,color:'#0a84ff'}}>{trigger.name}</h3>
              <p><strong>Type:</strong> {trigger.type}</p>
              <p><strong>Purpose:</strong> {trigger.purpose}</p>
              <div style={{background:'#f5f5f5',padding:16,borderRadius:8,marginBottom:12}}>
                <pre style={{margin:0,fontSize:13,overflow:'auto'}}><code>{trigger.code}</code></pre>
              </div>
              <div style={{background:'#e8f4ff',padding:12,borderRadius:8,borderLeft:'4px solid #0a84ff'}}>
                <strong>Demo:</strong> {trigger.demo}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'procedures' && (
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          {procedures.map((proc, i) => (
            <div key={i} className="panel">
              <h3 style={{marginTop:0,color:'#ff9500'}}>{proc.name}</h3>
              <p><strong>Parameters:</strong> {proc.parameters}</p>
              <p><strong>Purpose:</strong> {proc.purpose}</p>
              <div style={{background:'#f5f5f5',padding:16,borderRadius:8,marginBottom:12}}>
                <pre style={{margin:0,fontSize:13,overflow:'auto'}}><code>{proc.code}</code></pre>
              </div>
              <div style={{background:'#fff9e6',padding:12,borderRadius:8,borderLeft:'4px solid #ff9500',marginBottom:12}}>
                <strong>Usage:</strong> 
                <pre style={{margin:'8px 0 0 0',fontSize:13}}><code>{proc.usage}</code></pre>
              </div>
              <div style={{background:'#e8f4ff',padding:12,borderRadius:8,borderLeft:'4px solid #0a84ff'}}>
                <strong>Demo:</strong> {proc.demo}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'functions' && (
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          {functions.map((func, i) => (
            <div key={i} className="panel">
              <h3 style={{marginTop:0,color:'#34c759'}}>{func.name}</h3>
              <p><strong>Parameters:</strong> {func.parameters}</p>
              <p><strong>Returns:</strong> {func.returns}</p>
              <p><strong>Purpose:</strong> {func.purpose}</p>
              <div style={{background:'#f5f5f5',padding:16,borderRadius:8,marginBottom:12}}>
                <pre style={{margin:0,fontSize:13,overflow:'auto'}}><code>{func.code}</code></pre>
              </div>
              <div style={{background:'#f0fdf4',padding:12,borderRadius:8,borderLeft:'4px solid #34c759',marginBottom:12}}>
                <strong>Usage:</strong> 
                <pre style={{margin:'8px 0 0 0',fontSize:13}}><code>{func.usage}</code></pre>
              </div>
              <div style={{background:'#e8f4ff',padding:12,borderRadius:8,borderLeft:'4px solid #0a84ff'}}>
                <strong>Demo:</strong> {func.demo}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'views' && (
        <div style={{display:'flex',flexDirection:'column',gap:24}}>
          {views.map((view, i) => (
            <div key={i} className="panel">
              <h3 style={{marginTop:0,color:'#af52de'}}>{view.name}</h3>
              <p><strong>Purpose:</strong> {view.purpose}</p>
              <div style={{background:'#f5f5f5',padding:16,borderRadius:8,marginBottom:12}}>
                <pre style={{margin:0,fontSize:13,overflow:'auto'}}><code>{view.code}</code></pre>
              </div>
              <div style={{background:'#f3e8ff',padding:12,borderRadius:8,borderLeft:'4px solid #af52de',marginBottom:12}}>
                <strong>Usage:</strong> 
                <pre style={{margin:'8px 0 0 0',fontSize:13}}><code>{view.usage}</code></pre>
              </div>
              <div style={{background:'#e8f4ff',padding:12,borderRadius:8,borderLeft:'4px solid #0a84ff'}}>
                <strong>Demo:</strong> {view.demo}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
