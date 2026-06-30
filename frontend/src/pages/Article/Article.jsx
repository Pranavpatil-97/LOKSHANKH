import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { articlesAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import brand from '../../config/brand'

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

  if (loading) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'#999' }}>
      लोड होत आहे...
    </div>
  )

  if (!article) return null

  return (
    <div style={{ minHeight:'100vh', width:'100%', maxWidth:'100vw',
      overflowX:'hidden', background:'#f5f5f5', fontFamily:'sans-serif' }}>

      {/* Nav */}
      <div style={{ background:'#B91C1C',
        padding:'0 clamp(12px,3vw,24px)', height:'52px',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span onClick={() => navigate('/')}
          style={{ color:'#fff', fontWeight:'700',
            fontSize:'clamp(14px,3.2vw,18px)', cursor:'pointer',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {brand.name}
        </span>
        <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
          {user?.role === 'admin' &&
            <button onClick={() => navigate('/admin')} style={navBtnStyle}>Admin</button>}
          {(user?.role === 'employee' || user?.role === 'admin') &&
            <button onClick={() => navigate('/editor')} style={navBtnStyle}>Editor</button>}
          <button onClick={() => navigate('/')} style={navBtnStyle}>होम</button>
        </div>
      </div>

      <div style={{ maxWidth:'780px', margin:'0 auto',
        padding:'clamp(16px,4vw,32px) clamp(12px,3vw,16px)',
        width:'100%', boxSizing:'border-box' }}>

        <span onClick={() => navigate(-1)}
          style={{ fontSize:'13px', color:'#B91C1C', cursor:'pointer',
            marginBottom:'20px', display:'inline-block' }}>
          ← मागे जा
        </span>

        <div style={{ background:'#FEF2F2', color:'#B91C1C',
          fontSize:'12px', fontWeight:'500', padding:'4px 12px',
          borderRadius:'20px', display:'inline-block', marginBottom:'12px' }}>
          {article.category?.nameMarathi || article.category?.name}
        </div>

        <h1 style={{ fontSize:'clamp(20px,5vw,28px)', fontWeight:'700',
          lineHeight:'1.35', color:'#111', marginBottom:'12px',
          overflowWrap:'break-word' }}>
          {article.title}
        </h1>

        <div style={{ fontSize:'clamp(11px,2.4vw,13px)', color:'#666',
          marginBottom:'20px', display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <span>✍️ {article.author?.name}</span>
          <span>🕐 {timeAgo(article.publishedAt)}</span>
          <span>👁️ {article.views} वाचन</span>
        </div>

        {article.thumbnail && (
          <img src={article.thumbnail} alt={article.title} loading="lazy"
            style={{ width:'100%', borderRadius:'12px', marginBottom:'24px',
              aspectRatio:'16/9', objectFit:'cover' }} />
        )}

        {article.excerpt && (
          <p style={{ fontSize:'clamp(13px,2.8vw,15px)', lineHeight:'1.9',
            fontWeight:'500', color:'#444',
            borderLeft:'3px solid #B91C1C', paddingLeft:'16px',
            marginBottom:'20px', overflowWrap:'break-word' }}>
            {article.excerpt}
          </p>
        )}

        <div style={{ fontSize:'clamp(14px,3vw,16px)', lineHeight:'1.9',
          color:'#222', whiteSpace:'pre-wrap', overflowWrap:'break-word' }}>
          {article.content}
        </div>

        {article.tags?.length > 0 && (
          <div style={{ marginTop:'28px', display:'flex',
            gap:'8px', flexWrap:'wrap' }}>
            {article.tags.map((t, i) => (
              <span key={i} style={{ background:'#f0f0f0', color:'#555',
                fontSize:'12px', padding:'4px 12px', borderRadius:'20px' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const navBtnStyle = {
  background:'rgba(255,255,255,0.2)', color:'#fff', border:'none',
  padding:'6px clamp(8px,2vw,14px)', borderRadius:'6px',
  cursor:'pointer', fontSize:'clamp(11px,2.4vw,13px)', whiteSpace:'nowrap'
}

export default Article