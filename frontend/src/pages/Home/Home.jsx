import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { articlesAPI, adminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'
import { wakeUpServer } from '../../services/api'
const Home = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [articles, setArticles]     = useState([])
  const [trending, setTrending]     = useState([])
  const [breaking, setBreaking]     = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected]     = useState('')
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [tickerIdx, setTickerIdx]   = useState(0)
  const [menuOpen, setMenuOpen]     = useState(false)

  useEffect(() => { fetchAll() }, [selected])
   
  useEffect(() => {
  wakeUpServer()
}, [])
  useEffect(() => {
    if (breaking.length === 0) return
    const t = setInterval(() => {
      setTickerIdx(i => (i + 1) % breaking.length)
    }, 4000)
    return () => clearInterval(t)
  }, [breaking])

  const fetchAll = async () => {
  setLoading(true)
  try {
    const [artRes, trendRes, breakRes, catRes] = await Promise.all([
      articlesAPI.getAll({ category: selected, limit: 8 }),
      articlesAPI.getTrending(),
      articlesAPI.getBreaking(),
      adminAPI.getCategories()
    ])
    setArticles(artRes.data.articles)
    setTrending(trendRes.data.articles)
    setBreaking(breakRes.data.articles)
    setCategories(catRes.data.categories)
  } catch (err) {
    console.error('API Error:', err)
    // Retry once after 3 seconds if backend was sleeping
    setTimeout(() => fetchAll(), 3000)
  } finally {
    setLoading(false)
  }
}

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${search}`)
  }

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000)
    if (diff < 60) return `${diff} मि. पूर्वी`
    if (diff < 1440) return `${Math.floor(diff / 60)} तास पूर्वी`
    return `${Math.floor(diff / 1440)} दिवस पूर्वी`
  }

  const hero      = articles[0]
  const secondary = articles.slice(1, 3)
  const rest      = articles.slice(3)

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5',
      fontFamily:'sans-serif' }}>

      {/* Top bar — hidden on mobile */}
      <div style={{ background:'#B91C1C', padding:'5px 0',
        display:'none' }} className="topbar-desktop">
      </div>

     {/* Header */}
<div style={{ background:'#fff', borderBottom:'1px solid #eee',
  position:'sticky', top:0, zIndex:200,
  boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
  <div style={{ maxWidth:'1200px', margin:'0 auto',
    padding:'0 20px', height:'64px',
    display:'grid',
    gridTemplateColumns:'auto 1fr auto',
    alignItems:'center', gap:'16px' }}>

    {/* LEFT — menu icon only */}
    <button onClick={() => setMenuOpen(!menuOpen)}
      style={{ background:'none', border:'none', cursor:'pointer',
        padding:'8px', borderRadius:'8px',
        display:'flex', flexDirection:'column',
        gap:'5px', alignItems:'center' }}>
      <span style={{ display:'block', width:'22px', height:'2px',
        background:'#222', borderRadius:'2px',
        transition:'all 0.2s' }} />
      <span style={{ display:'block', width:'22px', height:'2px',
        background:'#222', borderRadius:'2px',
        transition:'all 0.2s' }} />
      <span style={{ display:'block', width:'22px', height:'2px',
        background:'#222', borderRadius:'2px',
        transition:'all 0.2s' }} />
    </button>

    {/* CENTER — Logo + Name */}
    <div onClick={() => navigate('/')}
      style={{ cursor:'pointer', display:'flex',
        alignItems:'center', justifyContent:'center', gap:'10px' }}>
      <img src={brand.logo} alt={brand.name}
        style={{ height:'42px', width:'auto', objectFit:'contain' }}
        onError={e => e.target.style.display='none'} />
      <div>
        <div style={{ fontSize:'20px', fontWeight:'800',
          color:'#B91C1C', letterSpacing:'0.5px',
          lineHeight:'1.1' }}>
          {brand.name}
        </div>
        <div style={{ fontSize:'10px', color:'#888',
          letterSpacing:'0.3px' }}>
          {brand.tagline}
        </div>
      </div>
    </div>

    {/* RIGHT — attractive buttons */}
    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
      {user ? (
        <>
          {user.role === 'admin' && (
            <button onClick={() => navigate('/admin')}
              style={{ background:'linear-gradient(135deg,#534AB7,#3C3489)',
                color:'#fff', border:'none', padding:'7px 14px',
                borderRadius:'8px', cursor:'pointer', fontSize:'12px',
                fontWeight:'600', letterSpacing:'0.3px' }}>
              ⚙ Admin
            </button>
          )}
          {(user.role === 'employee' || user.role === 'admin') && (
            <button onClick={() => navigate('/editor')}
              style={{ background:'linear-gradient(135deg,#0F6E56,#085041)',
                color:'#fff', border:'none', padding:'7px 14px',
                borderRadius:'8px', cursor:'pointer', fontSize:'12px',
                fontWeight:'600' }}>
              ✏ Editor
            </button>
          )}
          <button onClick={() => { logout(); navigate('/') }}
            style={{ background:'none', color:'#B91C1C',
              border:'2px solid #B91C1C', padding:'6px 14px',
              borderRadius:'8px', cursor:'pointer', fontSize:'12px',
              fontWeight:'600' }}>
            लॉगआउट
          </button>
        </>
      ) : (
        <>
          <button onClick={() => navigate('/register')}
            style={{ background:'linear-gradient(135deg,#B91C1C,#7F1D1D)',
              color:'#fff', border:'none', padding:'8px 18px',
              borderRadius:'8px', cursor:'pointer', fontSize:'13px',
              fontWeight:'600', boxShadow:'0 2px 8px rgba(185,28,28,0.3)' }}>
            नोंदणी
          </button>
          <button onClick={() => navigate('/login')}
            style={{ background:'#fff', color:'#333',
              border:'1.5px solid #ddd', padding:'7px 18px',
              borderRadius:'8px', cursor:'pointer', fontSize:'13px',
              fontWeight:'500' }}>
            लॉगिन
          </button>
        </>
      )}
    </div>
  </div>
</div>

{/* SIDEBAR DRAWER */}
{menuOpen && (
  <>
    {/* Backdrop */}
    <div onClick={() => setMenuOpen(false)}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
        zIndex:300 }} />

    {/* Drawer */}
    <div style={{ position:'fixed', top:0, left:0, bottom:0,
      width:'320px', background:'#fff', zIndex:400,
      overflowY:'auto', boxShadow:'4px 0 20px rgba(0,0,0,0.15)' }}>

      {/* Drawer header */}
      <div style={{ background:'#B91C1C', padding:'16px 20px',
        display:'flex', alignItems:'center',
        justifyContent:'space-between' }}>
        <div style={{ color:'#fff', fontWeight:'700', fontSize:'16px' }}>
          {brand.name}
        </div>
        <button onClick={() => setMenuOpen(false)}
          style={{ background:'rgba(255,255,255,0.2)', border:'none',
            color:'#fff', width:'32px', height:'32px', borderRadius:'50%',
            cursor:'pointer', fontSize:'16px', fontWeight:'700' }}>
          ✕
        </button>
      </div>

      {/* Search inside drawer */}
      <div style={{ padding:'16px 20px',
        borderBottom:'1px solid #f0f0f0' }}>
        <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false) }}
          style={{ display:'flex', gap:'8px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="बातमी शोधा..."
            style={{ flex:1, padding:'9px 14px', borderRadius:'8px',
              border:'1.5px solid #ddd', fontSize:'14px', outline:'none' }} />
          <button type="submit"
            style={{ background:'#B91C1C', color:'#fff', border:'none',
              padding:'9px 16px', borderRadius:'8px',
              cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
            शोधा
          </button>
        </form>
      </div>

      {/* Quick sections */}
      <div style={{ padding:'12px 20px',
        borderBottom:'1px solid #f0f0f0' }}>
        <div style={{ fontSize:'11px', fontWeight:'700', color:'#999',
          letterSpacing:'1px', marginBottom:'10px' }}>
          विभाग
        </div>
        {[
          { label:'🏠 मुख्यपृष्ठ',       action: () => { setSelected(''); setMenuOpen(false); navigate('/') } },
          { label:'🔥 ट्रेंडिंग न्यूज', action: () => { setMenuOpen(false) } },
          { label:'⚡ ब्रेकिंग न्यूज',  action: () => { setMenuOpen(false) } },
          { label:'📅 आजच्या बातम्या',   action: () => { setMenuOpen(false) } },
          { label:'📰 काल च्या बातम्या', action: () => { setMenuOpen(false) } },
          { label:'⭐ विशेष रिपोर्ट',    action: () => { setSelected(categories.find(c=>c.slug==='vishesh-report')?._id||''); setMenuOpen(false) } },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            style={{ display:'block', width:'100%', textAlign:'left',
              padding:'10px 12px', borderRadius:'8px', border:'none',
              background:'none', cursor:'pointer', fontSize:'14px',
              color:'#222', marginBottom:'2px',
              fontWeight:'500' }}
            onMouseEnter={e => e.target.style.background='#FEF2F2'}
            onMouseLeave={e => e.target.style.background='none'}>
            {item.label}
          </button>
        ))}
      </div>

      {/* All Categories */}
      <div style={{ padding:'12px 20px',
        borderBottom:'1px solid #f0f0f0' }}>
        <div style={{ fontSize:'11px', fontWeight:'700', color:'#999',
          letterSpacing:'1px', marginBottom:'10px' }}>
          सर्व विषय
        </div>
        {categories.map(c => (
          <button key={c._id}
            onClick={() => { setSelected(c._id); setMenuOpen(false) }}
            style={{ display:'flex', alignItems:'center',
              justifyContent:'space-between', width:'100%',
              textAlign:'left', padding:'10px 12px',
              borderRadius:'8px', border:'none',
              background: selected === c._id ? '#FEF2F2' : 'none',
              cursor:'pointer', fontSize:'14px',
              color: selected === c._id ? '#B91C1C' : '#222',
              marginBottom:'2px', fontWeight: selected === c._id ? '600' : '400' }}
            onMouseEnter={e => e.target.style.background='#FEF2F2'}
            onMouseLeave={e => e.target.style.background = selected===c._id?'#FEF2F2':'none'}>
            <span>{c.nameMarathi || c.name}</span>
            {selected === c._id && <span style={{ color:'#B91C1C' }}>✓</span>}
          </button>
        ))}
      </div>

      {/* User section */}
      <div style={{ padding:'16px 20px' }}>
        {user ? (
          <div>
            <div style={{ fontSize:'13px', color:'#666',
              marginBottom:'12px', padding:'10px 12px',
              background:'#f9f9f9', borderRadius:'8px' }}>
              👤 {user.name}<br />
              <span style={{ fontSize:'11px', color:'#B91C1C',
                fontWeight:'600' }}>{user.role}</span>
            </div>
            {user.role === 'admin' && (
              <button onClick={() => { navigate('/admin'); setMenuOpen(false) }}
                style={drawerBtnStyle('#534AB7')}>
                ⚙ Admin Panel
              </button>
            )}
            {(user.role === 'employee' || user.role === 'admin') && (
              <button onClick={() => { navigate('/editor'); setMenuOpen(false) }}
                style={drawerBtnStyle('#0F6E56')}>
                ✏ Editor Panel
              </button>
            )}
            <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }}
              style={drawerBtnStyle('#B91C1C')}>
              लॉगआउट
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            <button onClick={() => { navigate('/register'); setMenuOpen(false) }}
              style={drawerBtnStyle('#B91C1C')}>
              नोंदणी करा
            </button>
            <button onClick={() => { navigate('/login'); setMenuOpen(false) }}
              style={{ ...drawerBtnStyle('#333'), background:'#fff',
                color:'#333', border:'1.5px solid #ddd' }}>
              लॉगिन करा
            </button>
          </div>
        )}
      </div>
    </div>
  </>
)}
      {/* Category nav */}
      <div style={{ background:'#fff', borderBottom:'2px solid #B91C1C',
        overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
        <div style={{ display:'flex', padding:'0 16px',
          minWidth:'max-content' }}>
          <button onClick={() => setSelected('')}
            style={navLinkStyle(!selected)}>
            सर्व
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setSelected(c._id)}
              style={navLinkStyle(selected === c._id)}>
              {c.nameMarathi || c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Breaking ticker */}
      {breaking.length > 0 && (
        <div style={{ background:'#FEF2F2', borderBottom:'1px solid #FECACA',
          padding:'7px 16px', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ background:'#B91C1C', color:'#fff', fontSize:'11px',
            fontWeight:'600', padding:'2px 8px', borderRadius:'4px',
            whiteSpace:'nowrap', flexShrink:0 }}>
            ब्रेकिंग
          </span>
          <span style={{ fontSize:'13px', color:'#7F1D1D',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {breaking[tickerIdx]?.title}
          </span>
        </div>
      )}

      {/* Main */}
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'16px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
            बातम्या लोड होत आहेत...
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
            <p>अजून कोणत्याही बातम्या प्रकाशित नाहीत.</p>
          </div>
        ) : (
          <>
            {/* Responsive grid: 1 col mobile, 2 col tablet, sidebar on desktop */}
            <div style={{ display:'grid',
              gridTemplateColumns:'minmax(0,1fr)',
              gap:'20px' }}>

              {/* Hero */}
              {hero && (
                <div onClick={() => navigate(`/article/${hero.slug}`)}
                  style={{ borderRadius:'12px', overflow:'hidden',
                    cursor:'pointer', position:'relative',
                    height:'clamp(200px, 40vw, 320px)',
                    background:'linear-gradient(135deg,#1e3a5f,#374151)' }}>
                  {hero.thumbnail && (
                    <img src={hero.thumbnail} alt={hero.title}
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  )}
                  <div style={{ position:'absolute', inset:0,
                    background:'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' }} />
                  <div style={{ position:'absolute', bottom:0,
                    left:0, right:0, padding:'16px' }}>
                    <span style={{ background:'#B91C1C', color:'#fff',
                      fontSize:'10px', fontWeight:'600', padding:'2px 8px',
                      borderRadius:'4px', display:'inline-block', marginBottom:'6px' }}>
                      {hero.category?.nameMarathi || hero.category?.name}
                    </span>
                    <div style={{ fontSize:'clamp(14px,3.5vw,20px)',
                      fontWeight:'600', color:'#fff', lineHeight:'1.35' }}>
                      {hero.title}
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)',
                      marginTop:'4px' }}>
                      {hero.author?.name} · {timeAgo(hero.publishedAt)}
                    </div>
                  </div>
                </div>
              )}

              {/* Two column layout on tablet+ */}
              <div style={{ display:'grid',
                gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
                gap:'16px' }}>

                {/* Secondary cards */}
                {secondary.map(a => (
                  <div key={a._id}
                    onClick={() => navigate(`/article/${a.slug}`)}
                    style={{ background:'#fff', borderRadius:'10px',
                      overflow:'hidden', cursor:'pointer',
                      border:'1px solid #eee', display:'flex',
                      flexDirection:'column' }}>
                    <div style={{ height:'140px',
                      background:'linear-gradient(135deg,#374151,#6B7280)' }}>
                      {a.thumbnail && (
                        <img src={a.thumbnail} alt={a.title}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      )}
                    </div>
                    <div style={{ padding:'12px' }}>
                      <div style={{ fontSize:'10px', color:'#B91C1C',
                        fontWeight:'600', marginBottom:'4px',
                        textTransform:'uppercase' }}>
                        {a.category?.nameMarathi || a.category?.name}
                      </div>
                      <div style={{ fontSize:'14px', fontWeight:'500',
                        lineHeight:'1.4', color:'#111', marginBottom:'4px' }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize:'11px', color:'#999' }}>
                        {timeAgo(a.publishedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main + Sidebar layout on desktop */}
              <div style={{ display:'grid',
                gridTemplateColumns:'minmax(0,1fr)',
                gap:'20px' }}>

                {/* More articles grid */}
                {rest.length > 0 && (
                  <div>
                    <div style={{ fontSize:'16px', fontWeight:'600',
                      color:'#111', marginBottom:'12px',
                      display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'4px', height:'18px',
                        background:'#B91C1C', borderRadius:'2px',
                        display:'inline-block' }} />
                      ताज्या बातम्या
                    </div>
                    <div style={{ display:'grid',
                      gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',
                      gap:'12px' }}>
                      {rest.map(a => (
                        <div key={a._id}
                          onClick={() => navigate(`/article/${a.slug}`)}
                          style={{ background:'#fff', borderRadius:'10px',
                            overflow:'hidden', cursor:'pointer',
                            border:'1px solid #eee' }}>
                          <div style={{ height:'90px',
                            background:'linear-gradient(135deg,#1e3a5f,#374151)' }}>
                            {a.thumbnail && (
                              <img src={a.thumbnail} alt={a.title}
                                style={{ width:'100%', height:'100%',
                                  objectFit:'cover' }} />
                            )}
                          </div>
                          <div style={{ padding:'10px' }}>
                            <div style={{ fontSize:'10px', color:'#B91C1C',
                              fontWeight:'600', marginBottom:'3px' }}>
                              {a.category?.nameMarathi || a.category?.name}
                            </div>
                            <div style={{ fontSize:'12px', fontWeight:'500',
                              lineHeight:'1.4', color:'#111', marginBottom:'3px' }}>
                              {a.title}
                            </div>
                            <div style={{ fontSize:'10px', color:'#999' }}>
                              {timeAgo(a.publishedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending sidebar */}
                {trending.length > 0 && (
                  <div style={{ background:'#fff', borderRadius:'12px',
                    border:'1px solid #eee', overflow:'hidden' }}>
                    <div style={{ padding:'12px 16px',
                      borderBottom:'1px solid #eee', fontSize:'14px',
                      fontWeight:'600' }}>
                      ट्रेंडिंग न्यूज
                    </div>
                    {trending.map((a, i) => (
                      <div key={a._id}
                        onClick={() => navigate(`/article/${a.slug}`)}
                        style={{ display:'flex', gap:'10px', padding:'10px 16px',
                          borderBottom:'1px solid #f5f5f5', cursor:'pointer' }}>
                        <span style={{ fontSize:'20px', fontWeight:'700',
                          color:'#FECACA', minWidth:'28px', flexShrink:0 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:'500',
                            lineHeight:'1.4', color:'#111' }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize:'11px', color:'#999',
                            marginTop:'2px' }}>
                            {timeAgo(a.publishedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ background:'#fff', borderTop:'1px solid #eee',
        padding:'24px 0 16px', marginTop:'32px' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 16px' }}>
          <div style={{ display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
            gap:'20px', marginBottom:'16px' }}>
            <div>
              <div style={{ fontSize:'15px', fontWeight:'700',
                color:'#B91C1C', marginBottom:'6px' }}>
                {brand.name}
              </div>
              <div style={{ fontSize:'12px', color:'#666', lineHeight:'1.7' }}>
                {brand.tagline} — महाराष्ट्रातील अग्रगण्य
                डिजिटल न्यूज पोर्टल.
              </div>
            </div>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'600',
                marginBottom:'8px' }}>महत्त्वाचे दुवे</div>
              {['/', '/login', '/register'].map((path, i) => (
                <div key={i} onClick={() => navigate(path)}
                  style={{ fontSize:'12px', color:'#666',
                    marginBottom:'5px', cursor:'pointer' }}>
                  {['मुख्यपृष्ठ', 'लॉगिन', 'नोंदणी'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize:'13px', fontWeight:'600',
                marginBottom:'8px' }}>संपर्क</div>
              <div style={{ fontSize:'12px', color:'#666', lineHeight:'1.7' }}>
                {brand.address}<br />{brand.email}
              </div>
            </div>
          </div>
          <div style={{ borderTop:'1px solid #eee', paddingTop:'12px',
            fontSize:'11px', color:'#999', textAlign:'center' }}>
            © {new Date().getFullYear()} {brand.name}. सर्व हक्क राखीव.
          </div>
        </div>
      </div>
    </div>
  )
}



const navLinkStyle = (active) => ({
  padding: '10px 14px', fontSize: '13px', fontWeight: '500',
  color: active ? '#B91C1C' : '#555', cursor: 'pointer',
  borderBottom: active ? '2px solid #B91C1C' : '2px solid transparent',
  background: 'none', border: 'none',
  borderBottom: active ? '2px solid #B91C1C' : '2px solid transparent',
  whiteSpace: 'nowrap'
})

const rightBtnStyle = (color) => ({
  background: 'none',
  color: color,
  border: `1px solid ${color}`,
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '500'
})

const menuBtnStyle = (color) => ({
  background: color,
  color: '#fff',
  border: 'none',
  padding: '9px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  textAlign: 'left',
  width: '100%'
})
const drawerBtnStyle = (color) => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 16px',
  borderRadius: '8px',
  border: 'none',
  background: color,
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  marginBottom: '8px'
})
export default Home