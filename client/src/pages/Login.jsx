import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_URL } from '../App'

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('alice@mail.com')
  const [password, setPassword] = useState('pass123')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const r = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Login failed')
      onLoggedIn(d.user)
      const redirectTo = location.state?.redirectTo || '/'
      navigate(redirectTo)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="section" style={{display:'grid',placeItems:'center'}}>
      <div className="panel" style={{width:'100%',maxWidth:420}}>
        <h1 className="page-title" style={{marginTop:0}}>Login</h1>
        <form onSubmit={submit}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p role="alert" className="muted" style={{color:'#ffb4b4'}}>{error}</p>}
          <div style={{marginTop:12,display:'flex',gap:10}}>
            <button className="btn btn-primary" type="submit">Login</button>
            <span className="muted" style={{alignSelf:'center'}}>Demo: alice@mail.com / pass123</span>
          </div>
        </form>
      </div>
    </section>
  )
}
