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
  const [allArticles, setAllArticles] = useState([])
const [artSearch, setArtSearch]     = useState('')
  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
  setLoading(true)
  try {
    const [analyticsRes, pendingRes, usersRes, allArtRes] = await Promise.all([
      adminAPI.getAnalytics(),
      adminAPI.getPending(),
      adminAPI.getUsers(),
      adminAPI.getAllArticles()
    ])
    setAnalytics(analyticsRes.data.analytics)
    setPending(pendingRes.data.articles)
    setUsers(usersRes.data.users)
    setAllArticles(allArtRes.data.articles)
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
 
  const handleDelete = async (id, title) => {
  if (!window.confirm(`हे बातमी कायमचे हटवायचे आहे का?\n\n"${title}"`)) return
  try {
    await adminAPI.deleteArticle(id)
    setAllArticles(allArticles.filter(a => a._id !== id))
    setAnalytics(prev => ({
      ...prev,
      totalArticles: prev.totalArticles - 1,
      publishedCount: prev.publishedCount - 1
    }))
    alert('बातमी हटवली!')
  } catch (err) {
    alert('हटवता आले नाही')
  }
}

  const s = {
  wrap:    { minHeight:'100vh', width:'100%', maxWidth:'100vw',
             overflowX:'hidden', background:'#f5f5f5', fontFamily:'sans-serif' },
  nav:     { background:'#B91C1C', padding:'0 clamp(12px,3vw,24px)',
             display:'flex', alignItems:'center', justifyContent:'space-between',
             height:'56px', flexWrap:'wrap', gap:'8px' },
  navL:    { color:'#fff', fontWeight:'600', fontSize:'clamp(13px,3vw,18px)',
             whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  navR:    { display:'flex', alignItems:'center', gap:'clamp(6px,1.5vw,16px)',
             flexWrap:'wrap' },
  navBtn:  { background:'rgba(255,255,255,0.2)', color:'#fff', border:'none',
             padding:'6px clamp(8px,2vw,14px)', borderRadius:'6px',
             cursor:'pointer', fontSize:'clamp(11px,2.4vw,13px)',
             whiteSpace:'nowrap' },
  body:    { maxWidth:'1100px', margin:'0 auto',
             padding:'clamp(16px,4vw,24px) clamp(10px,3vw,16px)',
             width:'100%', boxSizing:'border-box' },
  tabs:    { display:'flex', gap:'8px', marginBottom:'24px',
             flexWrap:'wrap', overflowX:'auto' },
  tab:     (active) => ({
             padding:'8px clamp(10px,2.5vw,18px)', borderRadius:'8px',
             border: active ? 'none' : '1px solid #ddd', cursor:'pointer',
             fontSize:'clamp(11px,2.4vw,13px)', fontWeight:'500',
             background: active ? '#B91C1C' : '#fff',
             color: active ? '#fff' : '#444', whiteSpace:'nowrap', flexShrink:0 }),
  grid:    { display:'grid',
             gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,180px),1fr))',
             gap:'16px', marginBottom:'28px' },
  card:    { background:'#fff', borderRadius:'12px',
             padding:'clamp(14px,3vw,20px)', border:'1px solid #e5e5e5' },
  cardNum: { fontSize:'clamp(22px,5vw,32px)', fontWeight:'700',
             color:'#B91C1C', marginBottom:'4px' },
  cardLbl: { fontSize:'13px', color:'#666' },
  tableWrap: { overflowX:'auto', WebkitOverflowScrolling:'touch' },
  table:   { width:'100%', minWidth:'600px', borderCollapse:'collapse',
             fontSize:'13px' },
  th:      { textAlign:'left', padding:'10px 12px', background:'#f9f9f9',
             borderBottom:'1px solid #eee', fontWeight:'500', color:'#444',
             whiteSpace:'nowrap' },
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
             color:'#fff', marginRight:'6px', whiteSpace:'nowrap' }),
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
  {['overview','pending','users','articles'].map(tab => (
    <button key={tab} style={s.tab(activeTab === tab)}
      onClick={() => setActiveTab(tab)}>
      {tab === 'overview'  ? 'Overview' :
       tab === 'pending'   ? `Pending (${pending.length})` :
       tab === 'users'     ? `Users (${users.length})` :
       `All Articles`}
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
                <div style={s.tableWrap}>
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
             <div style={s.tableWrap}>
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
              </div>
             
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={s.card}>
            <div style={s.title}>All Users</div>
            <div style={s.tableWrap}>
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
          </div>
        )}

        {/* All Articles Tab */}
{activeTab === 'articles' && (
  <div style={s.card}>
    <div style={{ display:'flex', alignItems:'center',
      justifyContent:'space-between', marginBottom:'16px',
      flexWrap:'wrap', gap:'10px' }}>
      <div style={s.title}>सर्व बातम्या</div>
      <input
        placeholder="शीर्षक शोधा..."
        value={artSearch}
        onChange={e => setArtSearch(e.target.value)}
        style={{ padding:'7px 12px', borderRadius:'8px',
          border:'1px solid #ddd', fontSize:'13px',
          outline:'none', width:'220px' }}
      />
    </div>

    {allArticles.length === 0 ? (
      <p style={{ color:'#999', fontSize:'14px' }}>
        कोणत्याही बातम्या नाहीत.
      </p>
    ) : (
      <div style={s.tableWrap}>
  <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>शीर्षक</th>
            <th style={s.th}>लेखक</th>
            <th style={s.th}>विभाग</th>
            <th style={s.th}>स्थिती</th>
            <th style={s.th}>तारीख</th>
            <th style={s.th}>कृती</th>
          </tr>
        </thead>
        <tbody>
          {allArticles
            .filter(a => a.title.toLowerCase()
              .includes(artSearch.toLowerCase()))
            .map(a => (
            <tr key={a._id}>
              <td style={{ ...s.td, maxWidth:'240px' }}>
                <div style={{ fontWeight:'500', fontSize:'13px',
                  lineHeight:'1.4' }}>
                  {a.title}
                </div>
              </td>
              <td style={s.td}>
                <div style={{ fontSize:'13px' }}>{a.author?.name}</div>
                <div style={{ fontSize:'11px', color:'#999' }}>
                  {a.author?.email}
                </div>
              </td>
              <td style={s.td}>
                {a.category?.nameMarathi || a.category?.name || '—'}
              </td>
              <td style={s.td}>
                <span style={{
                  background:
                    a.status === 'published' ? '#E1F5EE' :
                    a.status === 'pending'   ? '#FAEEDA' :
                    a.status === 'rejected'  ? '#FEF2F2' : '#f0f0f0',
                  color:
                    a.status === 'published' ? '#0F6E56' :
                    a.status === 'pending'   ? '#633806' :
                    a.status === 'rejected'  ? '#B91C1C' : '#666',
                  padding:'3px 10px', borderRadius:'20px',
                  fontSize:'11px', fontWeight:'500'
                }}>
                  {a.status}
                </span>
              </td>
              <td style={{ ...s.td, fontSize:'12px', color:'#666' }}>
                {new Date(a.createdAt).toLocaleDateString('mr-IN')}
              </td>
              <td style={s.td}>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {a.status === 'pending' && (
                    <button style={s.btn('green')}
                      onClick={() => handleApprove(a._id)}>
                      Approve
                    </button>
                  )}
                  {a.status === 'published' && (
                    <button
                      style={{ ...s.btn('red'),
                        background:'none', color:'#B91C1C',
                        border:'1px solid #B91C1C' }}
                      onClick={async () => {
                        try {
                          await adminAPI.deleteArticle(a._id)
                          setAllArticles(prev =>
                            prev.map(x => x._id === a._id
                              ? { ...x, status:'draft' } : x))
                        } catch { alert('Failed') }
                      }}>
                      Unpublish
                    </button>
                  )}
                  <button
                    style={{ padding:'5px 12px', borderRadius:'6px',
                      border:'none', cursor:'pointer', fontSize:'12px',
                      fontWeight:'500', background:'#B91C1C', color:'#fff' }}
                    onClick={() => handleDelete(a._id, a.title)}>
                    🗑 हटवा
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
</div>
    )}
  </div>
)}
      </div>
    </div>
  )
}

export default AdminDash