import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { articlesAPI } from '../../services/api'
import brand from '../../config/brand'

const Search = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState(q)

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

  return (
    <div style={{ minHeight:'100vh', width:'100%', maxWidth:'100vw',
      overflowX:'hidden', background:'#f5f5f5', fontFamily:'sans-serif' }}>

      <div style={{ background:'#B91C1C',
        padding:'0 clamp(12px,3vw,24px)', height:'52px',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span onClick={() => navigate('/')}
          style={{ color:'#fff', fontWeight:'700',
            fontSize:'clamp(14px,3.2vw,18px)', cursor:'pointer' }}>
          {brand.name}
        </span>
        <button onClick={() => navigate('/')}
          style={{ background:'rgba(255,255,255,0.2)', color:'#fff',
            border:'none', padding:'6px clamp(8px,2vw,14px)',
            borderRadius:'6px', cursor:'pointer',
            fontSize:'clamp(11px,2.4vw,13px)' }}>
          होम
        </button>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto',
        padding:'clamp(16px,4vw,32px) clamp(12px,3vw,16px)',
        width:'100%', boxSizing:'border-box' }}>

        <form onSubmit={handleSearch}
          style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="बातमी शोधा..."
            style={{ flex:1, minWidth:0, padding:'10px 16px',
              borderRadius:'8px', border:'1px solid #ddd',
              fontSize:'14px', outline:'none' }} />
          <button type="submit"
            style={{ background:'#B91C1C', color:'#fff', border:'none',
              padding:'10px clamp(14px,3vw,20px)', borderRadius:'8px',
              cursor:'pointer', fontSize:'14px', fontWeight:'500',
              flexShrink:0 }}>
            शोधा
          </button>
        </form>

        {loading ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'#999' }}>
            शोधत आहे...
          </div>
        ) : (
          <>
            <div style={{ fontSize:'clamp(14px,3vw,16px)', fontWeight:'600',
              color:'#111', marginBottom:'16px' }}>
              {results.length > 0
                ? `"${q}" साठी ${results.length} निकाल`
                : `"${q}" साठी कोणताही निकाल नाही`}
            </div>
            {results.map(a => (
              <div key={a._id}
                onClick={() => navigate(`/article/${a.slug}`)}
                style={{ background:'#fff', borderRadius:'10px',
                  border:'1px solid #eee', padding:'clamp(10px,2.5vw,16px)',
                  marginBottom:'12px', cursor:'pointer',
                  display:'flex', gap:'clamp(10px,2.5vw,16px)',
                  alignItems:'flex-start' }}>
                <div style={{ width:'clamp(70px,18vw,100px)',
                  aspectRatio:'4/3', borderRadius:'8px',
                  objectFit:'cover', flexShrink:0,
                  background:'linear-gradient(135deg,#1e3a5f,#374151)',
                  overflow:'hidden' }}>
                  {a.thumbnail && (
                    <img src={a.thumbnail} alt={a.title} loading="lazy"
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'11px', color:'#B91C1C',
                    fontWeight:'500', marginBottom:'4px',
                    textTransform:'uppercase' }}>
                    {a.category?.nameMarathi || a.category?.name}
                  </div>
                  <div style={{ fontSize:'clamp(13px,2.8vw,15px)', fontWeight:'500',
                    color:'#111', lineHeight:'1.4', marginBottom:'6px',
                    overflowWrap:'break-word' }}>
                    {a.title}
                  </div>
                  {a.excerpt && (
                    <div style={{ fontSize:'clamp(11px,2.4vw,13px)', color:'#666',
                      lineHeight:'1.5', overflowWrap:'break-word' }}>
                      {a.excerpt.slice(0, 120)}...
                    </div>
                  )}
                  <div style={{ fontSize:'11px', color:'#999', marginTop:'6px' }}>
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