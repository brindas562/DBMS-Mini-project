import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import EventDetail from './pages/EventDetail'
import MyBookings from './pages/MyBookings'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Analytics from './pages/Analytics'
import Venues from './pages/Venues'
import Profile from './pages/Profile'
import SQLQueries from './pages/SQLQueries'
import UsersAdmin from './pages/UsersAdmin'
import DatabaseObjects from './pages/DatabaseObjects'
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_URL}/api/me`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => d && setUser(d.user))
      .catch(() => {})
  }, [])

  const logout = async () => {
    await fetch(`${API_URL}/api/logout`, { method: 'POST', credentials: 'include' })
    setUser(null)
    navigate('/')
  }

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          <div className="brand"><Link to="/">EventHub</Link></div>
          <nav className="nav-links">
            <Link to="/events">Events</Link>
            <Link to="/venues">Venues</Link>
            <Link to="/bookings">My Bookings</Link>
            {user && (
              <>
                { (user.userRole === 'Organizer' || user.userRole === 'Admin') && (
                  <>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/analytics">Analytics</Link>
                  </>
                )}
                <Link to="/sql-queries">SQL Queries</Link>
                <Link to="/db-objects">DB Objects</Link>
                {user.userRole === 'Admin' && <Link to="/admin/users">Manage Users</Link>}
              </>
            )}
            {user ? (
              <>
                <Link to="/profile">Profile</Link>
                <button className="btn btn-ghost" onClick={logout}>Logout</button>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail user={user} />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/bookings" element={<MyBookings user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/analytics" element={<Analytics user={user} />} />
          <Route path="/sql-queries" element={<SQLQueries user={user} />} />
          <Route path="/db-objects" element={<DatabaseObjects />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/admin/users" element={<UsersAdmin user={user} />} />
          <Route path="/login" element={<Login onLoggedIn={setUser} />} />
        </Routes>
      </main>
      <footer>
        <div className="container">© {new Date().getFullYear()} EventHub</div>
      </footer>
    </>
  )
}

export { API_URL }
