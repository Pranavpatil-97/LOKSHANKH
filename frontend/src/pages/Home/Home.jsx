import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { articlesAPI, adminAPI, wakeUpServer } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'

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

  useEffect(() => { wakeUpServer() }, [])
  useEffect(() => { fetchAll() }, [selected])

  useEffect(() => {
    if (breaking.length === 0) return
    const t = setInterval(() => {
      setTickerIdx(i => (i + 1) % breaking.length)
    }, 4000)
    return () => clearInterval(t)
  }, [breaking])

  const fetchAll = async () => {
    setLoading(true)
    const results = await Promise.allSettled([
      articlesAPI.getAll({ category: selected, limit: 9 }),
      articlesAPI.getTrending(),
      articlesAPI.getBreaking(),
      adminAPI.getCategories()
    ])
    if (results[0].status === 'fulfilled') setArticles(results[0].value.data.articles)
    if (results[1].status === 'fulfilled') setTrending(results[1].value.data.articles)
    if (results[2].status === 'fulfilled') setBreaking(results[2].value.data.articles)
    if (results[3].status === 'fulfilled') setCategories(results[3].value.data.categories)
    setLoading(false)
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
    <div style={{ minHeight:'100vh', width:'100%', maxWidth:'100vw',
      overflowX:'hidden', background:'#f5f5f5', fontFamily:'sans-serif' }}>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #eee',
        position:'sticky', top:0, zIndex:200,
        boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto',
          padding:'clamp(8px,2vw,0px) clamp(10px,3vw,20px)',
          minHeight:'56px',
          display:'grid',
          gridTemplateColumns:'auto minmax(0,1fr) auto',
          alignItems:'center', gap:'clamp(6px,2vw,16px)' }}>

          {/* LEFT — menu icon only */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            style={{ background:'none', border:'none', cursor:'pointer',
              padding:'6px', borderRadius:'8px', flexShrink:0,
              display:'flex', flexDirection:'column',
              gap:'4px', alignItems:'center' }}>
            <span style={{ display:'block', width:'20px', height:'2px',
              background:'#222', borderRadius:'2px' }} />
            <span style={{ display:'block', width:'20px', height:'2px',
              background:'#222', borderRadius:'2px' }} />
            <span style={{ display:'block', width:'20px', height:'2px',
              background:'#222', borderRadius:'2px' }} />
          </button>

          {/* CENTER — Logo + Name */}
          <div onClick={() => navigate('/')}
            style={{ cursor:'pointer', display:'flex',
              alignItems:'center', justifyContent:'center', gap:'8px',
              minWidth:0, overflow:'hidden' }}>
            <img src={brand.logo} alt={brand.name}
              loading="lazy"
              style={{ height:'clamp(28px,6vw,42px)', width:'auto',
                objectFit:'contain', flexShrink:0 }}
              onError={e => e.target.style.display='none'} />
            <div style={{ minWidth:0, overflow:'hidden' }}>
              <div style={{ fontSize:'clamp(13px,3.2vw,20px)', fontWeight:'800',
                color:'#B91C1C', letterSpacing:'0.3px',
                lineHeight:'1.1', whiteSpace:'nowrap',
                overflow:'hidden', textOverflow:'ellipsis' }}>
                {brand.name}
              </div>
              <div style={{ fontSize:'clamp(8px,1.6vw,10px)', color:'#888',
                whiteSpace:'nowrap', overflow:'hidden',
                textOverflow:'ellipsis', display:'none' }}
                className="header-tagline">
                {brand.tagline}
              </div>
            </div>
          </div>

          {/* RIGHT — buttons */}
          <div style={{ display:'flex', alignItems:'center',
            gap:'clamp(4px,1.5vw,8px)', minWidth:0 }}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <button onClick={() => navigate('/admin')}
                    style={{ background:'linear-gradient(135deg,#534AB7,#3C3489)',
                      color:'#fff', border:'none',
                      padding:'clamp(5px,1.2vw,7px) clamp(8px,2vw,14px)',
                      borderRadius:'8px', cursor:'pointer',
                      fontSize:'clamp(10px,2.4vw,12px)',
                      fontWeight:'600', whiteSpace:'nowrap', flexShrink:0 }}>
                    Admin
                  </button>
                )}
                {(user.role === 'employee' || user.role === 'admin') && (
                  <button onClick={() => navigate('/editor')}
                    style={{ background:'linear-gradient(135deg,#0F6E56,#085041)',
                      color:'#fff', border:'none',
                      padding:'clamp(5px,1.2vw,7px) clamp(8px,2vw,14px)',
                      borderRadius:'8px', cursor:'pointer',
                      fontSize:'clamp(10px,2.4vw,12px)',
                      fontWeight:'600', whiteSpace:'nowrap', flexShrink:0,
                      display:'none' }}
                    className="header-editor-btn">
                    Editor
                  </button>
                )}
                <button onClick={() => { logout(); navigate('/') }}
                  style={{ background:'none', color:'#B91C1C',
                    border:'1.5px solid #B91C1C',
                    padding:'clamp(4px,1.2vw,6px) clamp(8px,2vw,14px)',
                    borderRadius:'8px', cursor:'pointer',
                    fontSize:'clamp(10px,2.4vw,12px)',
                    fontWeight:'600', whiteSpace:'nowrap', flexShrink:0 }}>
                  लॉगआउट
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/register')}
                  style={{ background:'linear-gradient(135deg,#B91C1C,#7F1D1D)',
                    color:'#fff', border:'none',
                    padding:'clamp(6px,1.5vw,8px) clamp(10px,3vw,18px)',
                    borderRadius:'8px', cursor:'pointer',
                    fontSize:'clamp(11px,2.6vw,13px)',
                    fontWeight:'600', whiteSpace:'nowrap', flexShrink:0,
                    display:'none' }}
                  className="header-register-btn">
                  नोंदणी
                </button>
                <button onClick={() => navigate('/login')}
                  style={{ background:'#fff', color:'#333',
                    border:'1.5px solid #ddd',
                    padding:'clamp(5px,1.4vw,7px) clamp(10px,3vw,18px)',
                    borderRadius:'8px', cursor:'pointer',
                    fontSize:'clamp(11px,2.6vw,13px)',
                    fontWeight:'500', whiteSpace:'nowrap', flexShrink:0 }}>
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
          <div onClick={() => setMenuOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
              zIndex:300 }} />

          <div style={{ position:'fixed', top:0, left:0, bottom:0,
            width:'min(85vw,320px)', background:'#fff', zIndex:400,
            overflowY:'auto', boxShadow:'4px 0 20px rgba(0,0,0,0.15)' }}>

            <div style={{ background:'#B91C1C', padding:'16px 20px',
              display:'flex', alignItems:'center',
              justifyContent:'space-between' }}>
              <div style={{ color:'#fff', fontWeight:'700', fontSize:'16px' }}>
                {brand.name}
              </div>
              <button onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{ background:'rgba(255,255,255,0.2)', border:'none',
                  color:'#fff', width:'32px', height:'32px', borderRadius:'50%',
                  cursor:'pointer', fontSize:'16px', fontWeight:'700',
                  flexShrink:0 }}>
                ✕
              </button>
            </div>

            <div style={{ padding:'16px 20px',
              borderBottom:'1px solid #f0f0f0' }}>
              <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false) }}
                style={{ display:'flex', gap:'8px' }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="बातमी शोधा..."
                  style={{ flex:1, minWidth:0, padding:'9px 14px', borderRadius:'8px',
                    border:'1.5px solid #ddd', fontSize:'14px', outline:'none' }} />
                <button type="submit"
                  style={{ background:'#B91C1C', color:'#fff', border:'none',
                    padding:'9px 16px', borderRadius:'8px',
                    cursor:'pointer', fontSize:'13px', fontWeight:'600',
                    flexShrink:0 }}>
                  शोधा
                </button>
              </form>
            </div>

            <div style={{ padding:'12px 20px',
              borderBottom:'1px solid #f0f0f0' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#999',
                letterSpacing:'1px', marginBottom:'10px' }}>
                विभाग
              </div>
              {[
                { label:'🏠 मुख्यपृष्ठ',        action: () => { setSelected(''); setMenuOpen(false); navigate('/') } },
                { label:'⭐ विशेष रिपोर्ट',     action: () => { setSelected(categories.find(c=>c.slug==='vishesh-report')?._id||''); setMenuOpen(false) } },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  style={{ display:'block', width:'100%', textAlign:'left',
                    padding:'10px 12px', borderRadius:'8px', border:'none',
                    background:'none', cursor:'pointer', fontSize:'14px',
                    color:'#222', marginBottom:'2px', fontWeight:'500' }}>
                  {item.label}
                </button>
              ))}
            </div>

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
                    marginBottom:'2px', fontWeight: selected === c._id ? '600' : '400' }}>
                  <span style={{ overflow:'hidden', textOverflow:'ellipsis',
                    whiteSpace:'nowrap' }}>{c.nameMarathi || c.name}</span>
                  {selected === c._id && <span style={{ flexShrink:0, marginLeft:'6px' }}>✓</span>}
                </button>
              ))}
            </div>

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

      {/* Category nav — scrollable, no scrollbar */}
      <div className="no-scrollbar" style={{ background:'#fff',
        borderBottom:'2px solid #B91C1C', overflowX:'auto',
        WebkitOverflowScrolling:'touch', maxWidth:'100%' }}>
        <div style={{ display:'flex', width:'max-content',
          padding:'0 clamp(10px,3vw,20px)', margin:'0 auto',
          maxWidth:'1200px' }}>
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
          padding:'7px clamp(10px,3vw,16px)', display:'flex',
          alignItems:'center', gap:'10px', overflow:'hidden' }}>
          <span style={{ background:'#B91C1C', color:'#fff', fontSize:'11px',
            fontWeight:'600', padding:'2px 8px', borderRadius:'4px',
            whiteSpace:'nowrap', flexShrink:0 }}>
            ब्रेकिंग
          </span>
          <span style={{ fontSize:'clamp(11px,2.6vw,13px)', color:'#7F1D1D',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            minWidth:0 }}>
            {breaking[tickerIdx]?.title}
          </span>
        </div>
      )}

      {/* Main */}
      <div style={{ maxWidth:'1200px', margin:'0 auto',
        padding:'clamp(10px,3vw,16px)', width:'100%', boxSizing:'border-box' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
            बातम्या लोड होत आहेत...
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
            <p>अजून कोणत्याही बातम्या प्रकाशित नाहीत.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Hero */}
            {hero && (
              <div onClick={() => navigate(`/article/${hero.slug}`)}
                style={{ borderRadius:'12px', overflow:'hidden',
                  cursor:'pointer', position:'relative', width:'100%',
                  height:'clamp(220px, 32vw, 480px)',
                  background:'linear-gradient(135deg,#1e3a5f,#374151)' }}>
                {hero.thumbnail && (
                  <img src={hero.thumbnail} alt={hero.title} loading="lazy"
                    style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                )}
                <div style={{ position:'absolute', inset:0,
                  background:'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' }} />
                <div style={{ position:'absolute', bottom:0,
                  left:0, right:0, padding:'clamp(12px,3vw,24px)' }}>
                  <span style={{ background:'#B91C1C', color:'#fff',
                    fontSize:'clamp(9px,1.8vw,11px)', fontWeight:'600',
                    padding:'2px 8px', borderRadius:'4px',
                    display:'inline-block', marginBottom:'6px' }}>
                    {hero.category?.nameMarathi || hero.category?.name}
                  </span>
                  <div style={{ fontSize:'clamp(15px,3.5vw,26px)',
                    fontWeight:'600', color:'#fff', lineHeight:'1.35',
                    overflowWrap:'break-word' }}>
                    {hero.title}
                  </div>
                  <div style={{ fontSize:'clamp(10px,2vw,13px)',
                    color:'rgba(255,255,255,0.7)', marginTop:'4px' }}>
                    {hero.author?.name} · {timeAgo(hero.publishedAt)}
                  </div>
                </div>
              </div>
            )}

            {/* Secondary cards — same column rules as rest grid */}
            {secondary.length > 0 && (
              <div style={{ display:'grid',
                gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,260px),1fr))',
                gap:'14px', alignItems:'stretch' }}>
                {secondary.map(a => (
                  <div key={a._id}
                    onClick={() => navigate(`/article/${a.slug}`)}
                    style={{ background:'#fff', borderRadius:'10px',
                      overflow:'hidden', cursor:'pointer',
                      border:'1px solid #eee', display:'flex',
                      flexDirection:'column', height:'100%' }}>
                    <div style={{ width:'100%', aspectRatio:'16/9',
                      background:'linear-gradient(135deg,#374151,#6B7280)' }}>
                      {a.thumbnail && (
                        <img src={a.thumbnail} alt={a.title} loading="lazy"
                          style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      )}
                    </div>
                    <div style={{ padding:'12px', display:'flex',
                      flexDirection:'column', flex:1 }}>
                      <div style={{ fontSize:'10px', color:'#B91C1C',
                        fontWeight:'600', marginBottom:'4px',
                        textTransform:'uppercase' }}>
                        {a.category?.nameMarathi || a.category?.name}
                      </div>
                      <div style={{ fontSize:'clamp(12px,2.4vw,14px)', fontWeight:'500',
                        lineHeight:'1.4', color:'#111', marginBottom:'4px',
                        display:'-webkit-box', WebkitLineClamp:2,
                        WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize:'11px', color:'#999', marginTop:'auto' }}>
                        {timeAgo(a.publishedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main + Sidebar */}
            <div style={{ display:'grid',
              gridTemplateColumns: rest.length > 0 || trending.length > 0
                ? 'minmax(0,1fr)' : 'minmax(0,1fr)',
              gap:'20px' }}>

              {rest.length > 0 && (
                <div>
                  <div style={{ fontSize:'clamp(14px,3vw,16px)', fontWeight:'600',
                    color:'#111', marginBottom:'12px',
                    display:'flex', alignItems:'center', gap:'8px' }}>
                    <span style={{ width:'4px', height:'18px',
                      background:'#B91C1C', borderRadius:'2px',
                      display:'inline-block', flexShrink:0 }} />
                    ताज्या बातम्या
                  </div>
                  <div style={{ display:'grid',
                    gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,180px),1fr))',
                    gap:'12px', alignItems:'stretch' }}>
                    {rest.map(a => (
                      <div key={a._id}
                        onClick={() => navigate(`/article/${a.slug}`)}
                        style={{ background:'#fff', borderRadius:'10px',
                          overflow:'hidden', cursor:'pointer',
                          border:'1px solid #eee', display:'flex',
                          flexDirection:'column', height:'100%' }}>
                        <div style={{ width:'100%', aspectRatio:'16/9',
                          background:'linear-gradient(135deg,#1e3a5f,#374151)' }}>
                          {a.thumbnail && (
                            <img src={a.thumbnail} alt={a.title} loading="lazy"
                              style={{ width:'100%', height:'100%',
                                objectFit:'cover' }} />
                          )}
                        </div>
                        <div style={{ padding:'10px', display:'flex',
                          flexDirection:'column', flex:1 }}>
                          <div style={{ fontSize:'10px', color:'#B91C1C',
                            fontWeight:'600', marginBottom:'3px' }}>
                            {a.category?.nameMarathi || a.category?.name}
                          </div>
                          <div style={{ fontSize:'clamp(11px,2.2vw,12px)', fontWeight:'500',
                            lineHeight:'1.4', color:'#111', marginBottom:'3px',
                            display:'-webkit-box', WebkitLineClamp:2,
                            WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize:'10px', color:'#999', marginTop:'auto' }}>
                            {timeAgo(a.publishedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      <span style={{ fontSize:'18px', fontWeight:'700',
                        color:'#FECACA', minWidth:'26px', flexShrink:0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:'clamp(11px,2.2vw,13px)', fontWeight:'500',
                          lineHeight:'1.4', color:'#111',
                          display:'-webkit-box', WebkitLineClamp:2,
                          WebkitBoxOrient:'vertical', overflow:'hidden' }}>
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
        )}
      </div>

      {/* Footer */}
      <div style={{ background:'#fff', borderTop:'1px solid #eee',
        padding:'24px 0 16px', marginTop:'32px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto',
          padding:'0 clamp(10px,3vw,16px)' }}>
          <div style={{ display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',
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

      <style>{`
        @media (min-width: 600px) {
          .header-tagline { display: block !important; }
          .header-editor-btn { display: inline-flex !important; }
          .header-register-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  )
}

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

const navLinkStyle = (active) => ({
  padding: '10px 14px',
  fontSize: 'clamp(11px,2.4vw,13px)',
  fontWeight: '500',
  color: active ? '#B91C1C' : '#555',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  borderBottom: active ? '2px solid #B91C1C' : '2px solid transparent',
  whiteSpace: 'nowrap',
  flexShrink: 0
})

export default Home