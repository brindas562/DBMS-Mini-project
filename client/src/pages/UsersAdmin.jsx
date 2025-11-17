import { useEffect, useState } from 'react'
import { API_URL } from '../App'

export default function UsersAdmin({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ userName:'', userEmail:'', userPhone:'', userRole:'Customer', userPassword:'' })

  useEffect(() => {
    if (!user || user.userRole !== 'Admin') return
    load()
  }, [user])

  const load = async () => {
    try {
      setLoading(true)
      const r = await fetch(`${API_URL}/api/manage/users`, { credentials: 'include' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Failed')
      setUsers(d)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
   }

   const createUser = async (e) => {
     e.preventDefault()
     try {
       const payload = { ...form }
       const r = await fetch(`${API_URL}/api/manage/users`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify(payload)
       })
       const d = await r.json()
       if (!r.ok) throw new Error(d.error || 'Failed to create')
       alert('User created')
       setForm({ userName:'', userEmail:'', userPhone:'', userRole:'Customer', userPassword:'' })
       load()
     } catch (e) {
       alert(e.message)
     }
   }

   const deleteUser = async (id) => {
     if (!confirm('Delete this user?')) return
     try {
       const r = await fetch(`${API_URL}/api/manage/users/${id}`, { method: 'DELETE', credentials: 'include' })
       const d = await r.json()
       if (!r.ok) throw new Error(d.error || 'Failed')
       alert('User deleted')
       load()
     } catch (e) {
       alert(e.message)
     }
   }

   if (!user || user.userRole !== 'Admin') return <div className="section"><p className="muted">Admin access required.</p></div>

   return (
     <section className="section">
       <h2>Manage Users</h2>
       <div className="panel" style={{marginBottom:16}}>
         <h3>Create User</h3>
         <form onSubmit={createUser} style={{display:'grid',gap:8}}>
           <input placeholder="Name" value={form.userName} onChange={e=>setForm({...form,userName:e.target.value})} required />
           <input placeholder="Email" type="email" value={form.userEmail} onChange={e=>setForm({...form,userEmail:e.target.value})} required />
           <input placeholder="Phone" value={form.userPhone} onChange={e=>setForm({...form,userPhone:e.target.value})} />
           <select value={form.userRole} onChange={e=>setForm({...form,userRole:e.target.value})}>
             <option>Customer</option>
             <option>Organizer</option>
             <option>Admin</option>
           </select>
           <input placeholder="Password" type="password" value={form.userPassword} onChange={e=>setForm({...form,userPassword:e.target.value})} required />
           <div style={{display:'flex',gap:8}}>
             <button className="btn btn-primary" type="submit">Create</button>
             <button className="btn btn-ghost" type="button" onClick={()=>setForm({ userName:'', userEmail:'', userPhone:'', userRole:'Customer', userPassword:'' })}>Clear</button>
           </div>
         </form>
       </div>

       <div className="panel">
         <h3>All Users</h3>
         {loading ? <p className="muted">Loading...</p> : (
           <div style={{overflowX:'auto'}}>
             <table>
               <thead>
                 <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr>
               </thead>
               <tbody>
                 {users.map(u => (
                   <tr key={u.userId}>
                     <td>{u.userId}</td>
                     <td>{u.userName}</td>
                     <td>{u.userEmail}</td>
                     <td>{u.userPhone}</td>
                     <td>{u.userRole}</td>
                     <td>
                       <button className="btn btn-ghost" onClick={()=>deleteUser(u.userId)}>Delete</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>
     </section>
   )
 }
