import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'
import brand from '../../config/brand'

const AdminDash = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [analytics, setAnalytics]   = useState(null)
  const [pending, setPending]        = useState([])
  const [users, setUsers]            = useState([])
  const [activeTab, setActiveTab]    = useState('overview')
  const [loading, setLoading]        = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, pendingRes, usersRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getPending(),
        adminAPI.getUsers()
      ])
      setAnalytics(analyticsRes.data.analytics)
      setPending(pendingRes.data.articles)
      setUsers(usersRes.data.users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveArticle(id)
      setPending(pending.filter(a => a._id !== id))
      alert('Article approved and published!')
    } catch (err) { alert('Failed to approve') }
  }

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    try {
      await adminAPI.rejectArticle(id, reason)
      setPending(pending.filter(a => a._id !== id))
      alert('Article rejected.')
    } catch (err) { alert('Failed to reject') }
  }

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateRole(id, role)
      setUsers(users.map(u => u._id === id ? { ...u, role } : u))
    } catch (err) { alert('Failed to update role') }
  }

  const handleToggleUser = async (id) => {
    try {
      await adminAPI.toggleUser(id)
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u))
    } catch (err) { alert('Failed to toggle user') }
  }

  const s = {
    wrap:    { minHeight:'100vh', background:'#f5f5f5', fontFamily:'sans-serif' },
    nav:     { background:'#B91C1C', padding:'0 24px', display:'flex',
               alignItems:'center', justifyContent:'space-between', height:'56px' },
    navL:    { color:'#fff', fontWeight:'600', fontSize:'18px' },
    navR:    { display:'flex', alignItems:'center', gap:'16px' },
    navBtn:  { background:'rgba(255,255,255,0.2)', color:'#fff', border:'none',
               padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
    body:    { maxWidth:'1100px', margin:'0 auto', padding:'24px 16px' },
    tabs:    { display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' },
    tab:     (active) => ({
               padding:'8px 18px', borderRadius:'8px', border:'none', cursor:'pointer',
               fontSize:'13px', fontWeight:'500',
               background: active ? '#B91C1C' : '#fff',
               color: active ? '#fff' : '#444',
               border: active ? 'none' : '1px solid #ddd' }),
    grid:    { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
               gap:'16px', marginBottom:'28px' },
    card:    { background:'#fff', borderRadius:'12px', padding:'20px',
               border:'1px solid #e5e5e5' },
    cardNum: { fontSize:'32px', fontWeight:'700', color:'#B91C1C', marginBottom:'4px' },
    cardLbl: { fontSize:'13px', color:'#666' },
    table:   { width:'100%', borderCollapse:'collapse', fontSize:'13px' },
    th:      { textAlign:'left', padding:'10px 12px', background:'#f9f9f9',
               borderBottom:'1px solid #eee', fontWeight:'500', color:'#444' },
    td:      { padding:'10px 12px', borderBottom:'1px solid #f0f0f0',
               color:'#333', verticalAlign:'middle' },
    badge:   (color) => ({
               display:'inline-block', padding:'3px 10px', borderRadius:'20px',
               fontSize:'11px', fontWeight:'500',
               background: color === 'green' ? '#E1F5EE' : color === 'red' ? '#FEF2F2' : '#FEF9E7',
               color: color === 'green' ? '#0F6E56' : color === 'red' ? '#B91C1C' : '#B7770D' }),
    btn:     (color) => ({
               padding:'5px 12px', borderRadius:'6px', border:'none',
               cursor:'pointer', fontSize:'12px', fontWeight:'500',
               background: color === 'green' ? '#0F6E56' : color === 'red' ? '#B91C1C' : '#666',
               color:'#fff', marginRight:'6px' }),
    select:  { padding:'4px 8px', borderRadius:'6px', border:'1px solid #ddd',
               fontSize:'12px', cursor:'pointer' },
    title:   { fontSize:'16px', fontWeight:'600', marginBottom:'16px', color:'#111' }
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'#666' }}>
      Loading dashboard...
    </div>
  )

  return (
    <div style={s.wrap}>
      {/* Navbar */}
      <div style={s.nav}>
        <span style={s.navL}>{brand.name} — Admin Panel</span>
        <div style={s.navR}>
          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>
            {user?.name}
          </span>
          <button style={s.navBtn} onClick={() => navigate('/')}>
            साइट पहा
          </button>
          <button style={s.navBtn} onClick={() => { logout(); navigate('/login') }}>
            लॉगआउट
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Tabs */}
        <div style={s.tabs}>
          {['overview','pending','users'].map(tab => (
            <button key={tab} style={s.tab(activeTab === tab)}
              onClick={() => setActiveTab(tab)}>
              {tab === 'overview' ? 'Overview' :
               tab === 'pending' ? `Pending Articles (${pending.length})` :
               `Users (${users.length})`}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <>
            <div style={s.grid}>
              <div style={s.card}>
                <div style={s.cardNum}>{analytics.totalUsers}</div>
                <div style={s.cardLbl}>Total Users</div>
              </div>
              <div style={s.card}>
                <div style={s.cardNum}>{analytics.totalArticles}</div>
                <div style={s.cardLbl}>Total Articles</div>
              </div>
              <div style={s.card}>
                <div style={{...s.cardNum, color:'#D97706'}}>{analytics.pendingCount}</div>
                <div style={s.cardLbl}>Pending Approval</div>
              </div>
              <div style={s.card}>
                <div style={{...s.cardNum, color:'#0F6E56'}}>{analytics.publishedCount}</div>
                <div style={s.cardLbl}>Published Articles</div>
              </div>
              <div style={s.card}>
                <div style={{...s.cardNum, color:'#534AB7'}}>{analytics.totalViews}</div>
                <div style={s.cardLbl}>Total Views</div>
              </div>
            </div>

            {pending.length > 0 && (
              <div style={s.card}>
                <div style={s.title}>Pending Approvals</div>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Title</th>
                      <th style={s.th}>Author</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.slice(0,5).map(a => (
                      <tr key={a._id}>
                        <td style={s.td}>{a.title}</td>
                        <td style={s.td}>{a.author?.name}</td>
                        <td style={s.td}>
                          <button style={s.btn('green')} onClick={() => handleApprove(a._id)}>
                            Approve
                          </button>
                          <button style={s.btn('red')} onClick={() => handleReject(a._id)}>
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div style={s.card}>
            <div style={s.title}>Articles Pending Review</div>
            {pending.length === 0 ? (
              <p style={{ color:'#666', fontSize:'14px' }}>No pending articles.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Title</th>
                    <th style={s.th}>Author</th>
                    <th style={s.th}>Category</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map(a => (
                    <tr key={a._id}>
                      <td style={{...s.td, maxWidth:'250px'}}>
                        <div style={{ fontWeight:'500' }}>{a.title}</div>
                        <div style={{ fontSize:'11px', color:'#999', marginTop:'2px' }}>
                          {a.excerpt?.slice(0,60)}...
                        </div>
                      </td>
                      <td style={s.td}>{a.author?.name}<br/>
                        <span style={{fontSize:'11px',color:'#999'}}>{a.author?.email}</span>
                      </td>
                      <td style={s.td}>{a.category?.name || '—'}</td>
                      <td style={s.td}>
                        {new Date(a.createdAt).toLocaleDateString('mr-IN')}
                      </td>
                      <td style={s.td}>
                        <button style={s.btn('green')} onClick={() => handleApprove(a._id)}>
                          Approve
                        </button>
                        <button style={s.btn('red')} onClick={() => handleReject(a._id)}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={s.card}>
            <div style={s.title}>All Users</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Joined</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={s.td}>{u.name}</td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>
                      <select style={s.select} value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                        <option value="user">User</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={s.td}>
                      <span style={s.badge(u.isActive ? 'green' : 'red')}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td style={s.td}>
                      {new Date(u.createdAt).toLocaleDateString('mr-IN')}
                    </td>
                    <td style={s.td}>
                      <button
                        style={s.btn(u.isActive ? 'red' : 'green')}
                        onClick={() => handleToggleUser(u._id)}>
                        {u.isActive ? 'Ban' : 'Unban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDash