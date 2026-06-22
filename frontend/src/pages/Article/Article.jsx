import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { articlesAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Article = () => {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    articlesAPI.getBySlug(slug)
      .then(res => setArticle(res.data.article))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug])

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
    navL:    { color:'#fff', fontWeight:'700', fontSize:'18px',
               cursor:'pointer' },
    navR:    { display:'flex', gap:'12px' },
    navBtn:  { background:'rgba(255,255,255,0.2)', color:'#fff', border:'none',
               padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
    body:    { maxWidth:'780px', margin:'0 auto', padding:'32px 16px' },
    back:    { fontSize:'13px', color:'#B91C1C', cursor:'pointer',
               marginBottom:'20px', display:'inline-block' },
    cat:     { background:'#FEF2F2', color:'#B91C1C', fontSize:'12px',
               fontWeight:'500', padding:'4px 12px', borderRadius:'20px',
               display:'inline-block', marginBottom:'12px' },
    title:   { fontSize:'28px', fontWeight:'700', lineHeight:'1.35',
               color:'#111', marginBottom:'12px' },
    meta:    { fontSize:'13px', color:'#666', marginBottom:'20px',
               display:'flex', gap:'12px', flexWrap:'wrap' },
    img:     { width:'100%', borderRadius:'12px', marginBottom:'24px',
               maxHeight:'400px', objectFit:'cover' },
    content: { fontSize:'16px', lineHeight:'1.9', color:'#222',
               whiteSpace:'pre-wrap' },
    tags:    { marginTop:'28px', display:'flex', gap:'8px', flexWrap:'wrap' },
    tag:     { background:'#f0f0f0', color:'#555', fontSize:'12px',
               padding:'4px 12px', borderRadius:'20px' }
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
      लोड होत आहे...
    </div>
  )

  if (!article) return null

  return (
    <div style={s.wrap}>
      <div style={s.nav}>
        <span style={s.navL} onClick={() => navigate('/')}>LOKSHANKH</span>
        <div style={s.navR}>
          {user?.role === 'admin' &&
            <button style={s.navBtn} onClick={() => navigate('/admin')}>Admin</button>}
          {(user?.role === 'employee' || user?.role === 'admin') &&
            <button style={s.navBtn} onClick={() => navigate('/editor')}>Editor</button>}
          <button style={s.navBtn} onClick={() => navigate('/')}>होम</button>
        </div>
      </div>

      <div style={s.body}>
        <span style={s.back} onClick={() => navigate(-1)}>← मागे जा</span>

        <div style={s.cat}>
          {article.category?.nameMarathi || article.category?.name}
        </div>

        <h1 style={s.title}>{article.title}</h1>

        <div style={s.meta}>
          <span>✍️ {article.author?.name}</span>
          <span>🕐 {timeAgo(article.publishedAt)}</span>
          <span>👁️ {article.views} वाचन</span>
        </div>

        {article.thumbnail && (
          <img src={article.thumbnail} alt={article.title} style={s.img} />
        )}

        {article.excerpt && (
          <p style={{ ...s.content, fontWeight:'500', color:'#444',
            borderLeft:'3px solid #B91C1C', paddingLeft:'16px',
            marginBottom:'20px', fontSize:'15px' }}>
            {article.excerpt}
          </p>
        )}

        <div style={s.content}>{article.content}</div>

        {article.tags?.length > 0 && (
          <div style={s.tags}>
            {article.tags.map((t, i) => (
              <span key={i} style={s.tag}>#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Article