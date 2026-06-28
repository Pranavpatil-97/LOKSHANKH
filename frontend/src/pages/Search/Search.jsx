import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { articlesAPI } from '../../services/api'
import brand from '../../config/brand'
const Search = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''

  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState(q)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    articlesAPI.getAll({ search: q, limit: 20 })
      .then(res => setResults(res.data.articles))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [q])

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
    wrap:    { minHeight:'100vh', background:'#f5f5f5', fontFamily:'sans-serif' },
    nav:     { background:'#B91C1C', padding:'0 24px', height:'52px',
               display:'flex', alignItems:'center', justifyContent:'space-between' },
    navL:    { color:'#fff', fontWeight:'700', fontSize:'18px', cursor:'pointer' },
    navBtn:  { background:'rgba(255,255,255,0.2)', color:'#fff', border:'none',
               padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
    body:    { maxWidth:'900px', margin:'0 auto', padding:'32px 16px' },
    searchBox:{ display:'flex', gap:'8px', marginBottom:'24px' },
    input:   { flex:1, padding:'10px 16px', borderRadius:'8px',
               border:'1px solid #ddd', fontSize:'14px', outline:'none' },
    btn:     { background:'#B91C1C', color:'#fff', border:'none',
               padding:'10px 20px', borderRadius:'8px', cursor:'pointer',
               fontSize:'14px', fontWeight:'500' },
    heading: { fontSize:'16px', fontWeight:'600', color:'#111',
               marginBottom:'16px' },
    card:    { background:'#fff', borderRadius:'10px', border:'1px solid #eee',
               padding:'16px', marginBottom:'12px', cursor:'pointer',
               display:'flex', gap:'16px', alignItems:'flex-start' },
    img:     { width:'100px', height:'70px', borderRadius:'8px',
               objectFit:'cover', flexShrink:0,
               background:'linear-gradient(135deg,#1e3a5f,#374151)' },
    cat:     { fontSize:'11px', color:'#B91C1C', fontWeight:'500',
               marginBottom:'4px', textTransform:'uppercase' },
    title:   { fontSize:'15px', fontWeight:'500', color:'#111',
               lineHeight:'1.4', marginBottom:'6px' },
    excerpt: { fontSize:'13px', color:'#666', lineHeight:'1.5' },
    meta:    { fontSize:'11px', color:'#999', marginTop:'6px' }
  }

  return (
    <div style={s.wrap}>
      <div style={s.nav}>
       <span style={s.navL} onClick={() => navigate('/')}>{brand.name}</span>
        <button style={s.navBtn} onClick={() => navigate('/')}>होम</button>
      </div>

      <div style={s.body}>
        <form style={s.searchBox} onSubmit={handleSearch}>
          <input style={s.input} value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="बातमी शोधा..." />
          <button type="submit" style={s.btn}>शोधा</button>
        </form>

        {loading ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'#999' }}>
            शोधत आहे...
          </div>
        ) : (
          <>
            <div style={s.heading}>
              {results.length > 0
                ? `"${q}" साठी ${results.length} निकाल`
                : `"${q}" साठी कोणताही निकाल नाही`}
            </div>
            {results.map(a => (
              <div key={a._id} style={s.card}
                onClick={() => navigate(`/article/${a.slug}`)}>
                {a.thumbnail
                  ? <img src={a.thumbnail} alt={a.title} style={s.img} />
                  : <div style={s.img} />}
                <div style={{ flex:1 }}>
                  <div style={s.cat}>
                    {a.category?.nameMarathi || a.category?.name}
                  </div>
                  <div style={s.title}>{a.title}</div>
                  {a.excerpt &&
                    <div style={s.excerpt}>{a.excerpt.slice(0, 120)}...</div>}
                  <div style={s.meta}>
                    {a.author?.name} · {timeAgo(a.publishedAt)}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default Search