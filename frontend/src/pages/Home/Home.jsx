import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { articlesAPI, adminAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Home = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [articles, setArticles]   = useState([])
  const [trending, setTrending]   = useState([])
  const [breaking, setBreaking]   = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected]   = useState('')
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [tickerIdx, setTickerIdx] = useState(0)

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
      console.error(err)
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
    if (diff < 60) return `${diff} मिनिटांपूर्वी`
    if (diff < 1440) return `${Math.floor(diff/60)} तासांपूर्वी`
    return `${Math.floor(diff/1440)} दिवसांपूर्वी`
  }

  const s = {
    wrap:      { minHeight:'100vh', background:'#f5f5f5', fontFamily:'sans-serif' },
    topbar:    { background:'#B91C1C', padding:'6px 0' },
    topInner:  { maxWidth:'1100px', margin:'0 auto', padding:'0 16px',
                 display:'flex', justifyContent:'space-between',
                 alignItems:'center', fontSize:'12px', color:'rgba(255,255,255,0.8)' },
    header:    { background:'#fff', borderBottom:'1px solid #eee', padding:'14px 0' },
    headerIn:  { maxWidth:'1100px', margin:'0 auto', padding:'0 16px',
                 display:'flex', alignItems:'center', justifyContent:'space-between' },
    logo:      { fontSize:'22px', fontWeight:'700', color:'#B91C1C',
                 letterSpacing:'0.5px', cursor:'pointer' },
    logoSub:   { fontSize:'11px', color:'#666', marginTop:'2px' },
    searchBox: { display:'flex', gap:'8px' },
    searchInp: { padding:'8px 14px', borderRadius:'8px', border:'1px solid #ddd',
                 fontSize:'13px', width:'220px', outline:'none' },
    searchBtn: { background:'#B91C1C', color:'#fff', border:'none',
                 padding:'8px 16px', borderRadius:'8px', cursor:'pointer',
                 fontSize:'13px' },
    nav:       { background:'#fff', borderBottom:'2px solid #B91C1C',
                 position:'sticky', top:0, zIndex:100 },
    navIn:     { maxWidth:'1100px', margin:'0 auto', padding:'0 16px',
                 display:'flex', alignItems:'center', gap:'4px',
                 overflowX:'auto' },
    navLink:   (active) => ({
                 padding:'12px 14px', fontSize:'13px', fontWeight:'500',
                 color: active ? '#B91C1C' : '#555', cursor:'pointer',
                 borderBottom: active ? '2px solid #B91C1C' : '2px solid transparent',
                 marginBottom:'-2px', whiteSpace:'nowrap', background:'none',
                 border:'none', borderBottom: active ? '2px solid #B91C1C' : 'none' }),
    ticker:    { background:'#FEF2F2', borderBottom:'1px solid #FECACA',
                 padding:'8px 0', overflow:'hidden' },
    tickerIn:  { maxWidth:'1100px', margin:'0 auto', padding:'0 16px',
                 display:'flex', alignItems:'center', gap:'12px' },
    tickerLbl: { background:'#B91C1C', color:'#fff', fontSize:'11px',
                 fontWeight:'500', padding:'3px 10px', borderRadius:'4px',
                 whiteSpace:'nowrap' },
    tickerTxt: { fontSize:'13px', color:'#7F1D1D', whiteSpace:'nowrap',
                 overflow:'hidden', textOverflow:'ellipsis' },
    main:      { maxWidth:'1100px', margin:'0 auto', padding:'24px 16px' },
    grid:      { display:'grid', gridTemplateColumns:'1fr 320px', gap:'24px' },
    heroCard:  { position:'relative', borderRadius:'12px', overflow:'hidden',
                 cursor:'pointer', marginBottom:'16px', height:'320px',
                 background:'linear-gradient(135deg,#1e3a5f,#374151)' },
    heroImg:   { width:'100%', height:'100%', objectFit:'cover' },
    heroOvl:   { position:'absolute', inset:0,
                 background:'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' },
    heroBody:  { position:'absolute', bottom:0, left:0, right:0, padding:'20px' },
    heroCat:   { background:'#B91C1C', color:'#fff', fontSize:'11px',
                 fontWeight:'500', padding:'3px 8px', borderRadius:'4px',
                 display:'inline-block', marginBottom:'8px' },
    heroTitle: { fontSize:'20px', fontWeight:'600', color:'#fff',
                 lineHeight:'1.35', marginBottom:'6px' },
    heroMeta:  { fontSize:'12px', color:'rgba(255,255,255,0.7)' },
    smallGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
    smallCard: { background:'#fff', borderRadius:'10px', overflow:'hidden',
                 cursor:'pointer', border:'1px solid #eee',
                 display:'flex', flexDirection:'column' },
    smallImg:  { height:'120px', background:'linear-gradient(135deg,#374151,#6B7280)',
                 objectFit:'cover', width:'100%' },
    smallBody: { padding:'10px', flex:1 },
    smallCat:  { fontSize:'10px', color:'#B91C1C', fontWeight:'500',
                 textTransform:'uppercase', marginBottom:'4px' },
    smallTtl:  { fontSize:'13px', fontWeight:'500', lineHeight:'1.4',
                 color:'#111', marginBottom:'4px' },
    smallMeta: { fontSize:'11px', color:'#999' },
    sidebar:   { display:'flex', flexDirection:'column', gap:'20px' },
    sideCard:  { background:'#fff', borderRadius:'12px', border:'1px solid #eee',
                 overflow:'hidden' },
    sideHead:  { padding:'12px 16px', borderBottom:'1px solid #eee',
                 display:'flex', justifyContent:'space-between', alignItems:'center' },
    sideTitle: { fontSize:'14px', fontWeight:'600' },
    newsGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                 gap:'14px', marginTop:'24px' },
    newsCard:  { background:'#fff', borderRadius:'10px', overflow:'hidden',
                 cursor:'pointer', border:'1px solid #eee' },
    newsImg:   { height:'100px', background:'linear-gradient(135deg,#1e3a5f,#374151)',
                 objectFit:'cover', width:'100%' },
    newsBody:  { padding:'10px' },
    newsCat:   { fontSize:'10px', color:'#B91C1C', fontWeight:'500', marginBottom:'4px' },
    newsTtl:   { fontSize:'12px', fontWeight:'500', lineHeight:'1.45',
                 color:'#111', marginBottom:'4px' },
    newsMeta:  { fontSize:'10px', color:'#999' },
    secHead:   { display:'flex', alignItems:'center', justifyContent:'space-between',
                 margin:'28px 0 14px' },
    secLabel:  { fontSize:'17px', fontWeight:'600', display:'flex',
                 alignItems:'center', gap:'8px' },
    secBar:    { width:'4px', height:'20px', background:'#B91C1C',
                 borderRadius:'2px', display:'inline-block' },
    footer:    { background:'#fff', borderTop:'1px solid #eee',
                 padding:'28px 0 16px', marginTop:'40px' },
    footIn:    { maxWidth:'1100px', margin:'0 auto', padding:'0 16px' },
    footGrid:  { display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr',
                 gap:'24px', marginBottom:'20px' },
    footTitle: { fontSize:'14px', fontWeight:'600', color:'#B91C1C', marginBottom:'8px' },
    footText:  { fontSize:'12px', color:'#666', lineHeight:'1.7' },
    footLink:  { display:'block', fontSize:'12px', color:'#666',
                 marginBottom:'6px', cursor:'pointer' },
    footBot:   { borderTop:'1px solid #eee', paddingTop:'14px',
                 fontSize:'11px', color:'#999', textAlign:'center' }
  }

  const hero = articles[0]
  const secondary = articles.slice(1, 3)
  const rest = articles.slice(3)

  return (
    <div style={s.wrap}>

      {/* Top bar */}
      <div style={s.topbar}>
        <div style={s.topInner}>
          <span>{new Date().toLocaleDateString('mr-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
          <div style={{ display:'flex', gap:'16px' }}>
            {user ? (
              <>
                <span>{user.name}</span>
                {user.role === 'admin' &&
                  <span style={{ cursor:'pointer' }} onClick={() => navigate('/admin')}>Admin Panel</span>}
                {(user.role === 'employee' || user.role === 'admin') &&
                  <span style={{ cursor:'pointer' }} onClick={() => navigate('/editor')}>Editor Panel</span>}
                <span style={{ cursor:'pointer' }} onClick={() => { logout(); navigate('/') }}>लॉगआउट</span>
              </>
            ) : (
              <>
                <span style={{ cursor:'pointer' }} onClick={() => navigate('/login')}>लॉगिन</span>
                <span style={{ cursor:'pointer' }} onClick={() => navigate('/register')}>नोंदणी</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerIn}>
          <div onClick={() => navigate('/')} style={{ cursor:'pointer' }}>
            <div style={s.logo}>LOKSHANKH</div>
            <div style={s.logoSub}>NEWS NETWORK · आवाज जनतेचा, विश्वासाचा</div>
          </div>
          <form style={s.searchBox} onSubmit={handleSearch}>
            <input style={s.searchInp} placeholder="बातमी शोधा..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit" style={s.searchBtn}>शोधा</button>
          </form>
        </div>
      </div>

      {/* Nav */}
      <div style={s.nav}>
        <div style={s.navIn}>
          <button style={s.navLink(!selected)} onClick={() => setSelected('')}>
            मुख्यपृष्ठ
          </button>
          {categories.map(c => (
            <button key={c._id} style={s.navLink(selected === c._id)}
              onClick={() => setSelected(c._id)}>
              {c.nameMarathi || c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Breaking ticker */}
      {breaking.length > 0 && (
        <div style={s.ticker}>
          <div style={s.tickerIn}>
            <span style={s.tickerLbl}>ब्रेकिंग</span>
            <span style={s.tickerTxt}>
              {breaking[tickerIdx]?.title}
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={s.main}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
            बातम्या लोड होत आहेत...
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
            <p style={{ fontSize:'16px' }}>अजून कोणत्याही बातम्या प्रकाशित नाहीत.</p>
            {user?.role === 'employee' &&
              <button onClick={() => navigate('/editor')}
                style={{ marginTop:'12px', background:'#B91C1C', color:'#fff',
                  border:'none', padding:'10px 24px', borderRadius:'8px',
                  cursor:'pointer', fontSize:'14px' }}>
                पहिली बातमी लिहा
              </button>}
          </div>
        ) : (
          <>
            {/* Hero + sidebar */}
            <div style={s.grid}>
              <div>
                {/* Hero card */}
                {hero && (
                  <div style={s.heroCard} onClick={() => navigate(`/article/${hero.slug}`)}>
                    {hero.thumbnail
                      ? <img src={hero.thumbnail} alt={hero.title} style={s.heroImg} />
                      : <div style={{ ...s.heroImg, background:'linear-gradient(135deg,#1e3a5f,#374151)' }} />}
                    <div style={s.heroOvl} />
                    <div style={s.heroBody}>
                      <span style={s.heroCat}>
                        {hero.category?.nameMarathi || hero.category?.name}
                      </span>
                      <div style={s.heroTitle}>{hero.title}</div>
                      <div style={s.heroMeta}>
                        {hero.author?.name} · {timeAgo(hero.publishedAt)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Secondary cards */}
                <div style={s.smallGrid}>
                  {secondary.map(a => (
                    <div key={a._id} style={s.smallCard}
                      onClick={() => navigate(`/article/${a.slug}`)}>
                      {a.thumbnail
                        ? <img src={a.thumbnail} alt={a.title} style={s.smallImg} />
                        : <div style={s.smallImg} />}
                      <div style={s.smallBody}>
                        <div style={s.smallCat}>
                          {a.category?.nameMarathi || a.category?.name}
                        </div>
                        <div style={s.smallTtl}>{a.title}</div>
                        <div style={s.smallMeta}>{timeAgo(a.publishedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div style={s.sidebar}>
                {/* Trending */}
                <div style={s.sideCard}>
                  <div style={s.sideHead}>
                    <span style={s.sideTitle}>ट्रेंडिंग न्यूज</span>
                  </div>
                  <div>
                    {trending.map((a, i) => (
                      <div key={a._id}
                        onClick={() => navigate(`/article/${a.slug}`)}
                        style={{ display:'flex', gap:'12px', padding:'10px 16px',
                          borderBottom:'1px solid #f0f0f0', cursor:'pointer' }}>
                        <span style={{ fontSize:'22px', fontWeight:'700',
                          color:'#FECACA', minWidth:'28px' }}>
                          {String(i+1).padStart(2,'0')}
                        </span>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:'500',
                            lineHeight:'1.4', color:'#111' }}>{a.title}</div>
                          <div style={{ fontSize:'11px', color:'#999', marginTop:'3px' }}>
                            {timeAgo(a.publishedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div style={s.sideCard}>
                  <div style={s.sideHead}>
                    <span style={s.sideTitle}>विभाग</span>
                  </div>
                  <div style={{ padding:'12px 16px',
                    display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {categories.map(c => (
                      <span key={c._id}
                        onClick={() => setSelected(selected === c._id ? '' : c._id)}
                        style={{ padding:'5px 12px', borderRadius:'20px',
                          fontSize:'12px', cursor:'pointer', fontWeight:'500',
                          background: selected === c._id ? '#B91C1C' : '#FEF2F2',
                          color: selected === c._id ? '#fff' : '#B91C1C',
                          border:'1px solid #FECACA' }}>
                        {c.nameMarathi || c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* More articles */}
            {rest.length > 0 && (
              <>
                <div style={s.secHead}>
                  <div style={s.secLabel}>
                    <span style={s.secBar}></span>
                    ताज्या बातम्या
                  </div>
                </div>
                <div style={s.newsGrid}>
                  {rest.map(a => (
                    <div key={a._id} style={s.newsCard}
                      onClick={() => navigate(`/article/${a.slug}`)}>
                      {a.thumbnail
                        ? <img src={a.thumbnail} alt={a.title} style={s.newsImg} />
                        : <div style={s.newsImg} />}
                      <div style={s.newsBody}>
                        <div style={s.newsCat}>
                          {a.category?.nameMarathi || a.category?.name}
                        </div>
                        <div style={s.newsTtl}>{a.title}</div>
                        <div style={s.newsMeta}>{timeAgo(a.publishedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footIn}>
          <div style={s.footGrid}>
            <div>
              <div style={s.footTitle}>LOKSHANKH NEWS NETWORK</div>
              <div style={s.footText}>
                लोकशंख न्यूज नेटवर्क हे महाराष्ट्रातील अग्रगण्य डिजिटल
                न्यूज पोर्टल आहे. आम्ही आपल्याला सर्वात अचूक आणि
                विश्वासार्ह बातम्या देण्यासाठी कटिबद्ध आहोत.
              </div>
            </div>
            <div>
              <div style={s.footTitle}>महत्त्वाचे दुवे</div>
              <span style={s.footLink} onClick={() => navigate('/')}>मुख्यपृष्ठ</span>
              <span style={s.footLink} onClick={() => navigate('/login')}>लॉगिन</span>
              <span style={s.footLink} onClick={() => navigate('/register')}>नोंदणी</span>
            </div>
            <div>
              <div style={s.footTitle}>संपर्क</div>
              <div style={s.footText}>
                जळगाव, महाराष्ट्र 425001<br />
                info@lokshanknews.com
              </div>
            </div>
          </div>
          <div style={s.footBot}>
            © {new Date().getFullYear()} Lokshankh News Network. सर्व हक्क राखीव.
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home