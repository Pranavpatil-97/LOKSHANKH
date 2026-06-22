import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { articlesAPI, adminAPI, uploadAPI } from '../../services/api'
import { useNavigate } from 'react-router-dom'

const EditorDash = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [articles, setArticles]     = useState([])
  const [categories, setCategories] = useState([])
  const [activeTab, setActiveTab]   = useState('articles')
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [uploading, setUploading]   = useState(false)

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '',
    category: '', tags: '', thumbnail: ''
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [articlesRes, catsRes] = await Promise.all([
        articlesAPI.getMyArticles(),
        adminAPI.getCategories()
      ])
      setArticles(articlesRes.data.articles)
      setCategories(catsRes.data.categories)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await uploadAPI.uploadImage(formData)
      setForm(prev => ({ ...prev, thumbnail: res.data.url }))
      alert('Image uploaded!')
    } catch (err) {
      alert('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (status = 'draft') => {
    if (!form.title || !form.content || !form.category) {
      alert('Title, content and category are required')
      return
    }
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      }
      if (editingId) {
        await articlesAPI.update(editingId, payload)
        alert('Article updated!')
      } else {
        await articlesAPI.create(payload)
        alert('Article saved as draft!')
      }
      setShowForm(false)
      setEditingId(null)
      setForm({ title:'', content:'', excerpt:'', category:'', tags:'', thumbnail:'' })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save')
    }
  }

  const handleSubmit = async (id) => {
    if (!window.confirm('Submit this article for review?')) return
    try {
      await articlesAPI.submit(id)
      setArticles(articles.map(a =>
        a._id === id ? { ...a, status: 'pending' } : a
      ))
      alert('Submitted for review!')
    } catch (err) {
      alert('Failed to submit')
    }
  }

  const handleEdit = (article) => {
    setForm({
      title:     article.title,
      content:   article.content,
      excerpt:   article.excerpt || '',
      category:  article.category?._id || '',
      tags:      article.tags?.join(', ') || '',
      thumbnail: article.thumbnail || ''
    })
    setEditingId(article._id)
    setShowForm(true)
    setActiveTab('write')
  }

  const statusBadge = (status) => {
    const map = {
      draft:     { bg:'#F1EFE8', color:'#5F5E5A' },
      pending:   { bg:'#FAEEDA', color:'#633806' },
      published: { bg:'#E1F5EE', color:'#0F6E56' },
      rejected:  { bg:'#FEF2F2', color:'#B91C1C' }
    }
    const c = map[status] || map.draft
    return (
      <span style={{ background:c.bg, color:c.color, padding:'3px 10px',
        borderRadius:'20px', fontSize:'11px', fontWeight:'500' }}>
        {status}
      </span>
    )
  }

  const s = {
    wrap:   { minHeight:'100vh', background:'#f5f5f5', fontFamily:'sans-serif' },
    nav:    { background:'#B91C1C', padding:'0 24px', display:'flex',
              alignItems:'center', justifyContent:'space-between', height:'56px' },
    navL:   { color:'#fff', fontWeight:'600', fontSize:'18px' },
    navR:   { display:'flex', alignItems:'center', gap:'12px' },
    navBtn: { background:'rgba(255,255,255,0.2)', color:'#fff', border:'none',
              padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
    body:   { maxWidth:'1000px', margin:'0 auto', padding:'24px 16px' },
    tabs:   { display:'flex', gap:'8px', marginBottom:'24px' },
    tab:    (a) => ({
              padding:'8px 18px', borderRadius:'8px', border:'none', cursor:'pointer',
              fontSize:'13px', fontWeight:'500',
              background: a ? '#B91C1C' : '#fff',
              color: a ? '#fff' : '#444',
              border: a ? 'none' : '1px solid #ddd' }),
    card:   { background:'#fff', borderRadius:'12px', padding:'20px',
              border:'1px solid #e5e5e5', marginBottom:'16px' },
    table:  { width:'100%', borderCollapse:'collapse', fontSize:'13px' },
    th:     { textAlign:'left', padding:'10px 12px', background:'#f9f9f9',
              borderBottom:'1px solid #eee', fontWeight:'500', color:'#444' },
    td:     { padding:'10px 12px', borderBottom:'1px solid #f0f0f0', color:'#333' },
    btn:    (c) => ({
              padding:'5px 12px', borderRadius:'6px', border:'none',
              cursor:'pointer', fontSize:'12px', fontWeight:'500', marginRight:'6px',
              background: c==='red'?'#B91C1C': c==='green'?'#0F6E56':
                          c==='blue'?'#185FA5':'#888',
              color:'#fff' }),
    label:  { fontSize:'13px', fontWeight:'500', display:'block', marginBottom:'6px' },
    input:  { width:'100%', padding:'9px 12px', borderRadius:'8px',
              border:'1px solid #ddd', fontSize:'14px', outline:'none',
              marginBottom:'14px' },
    textarea:{ width:'100%', padding:'9px 12px', borderRadius:'8px',
               border:'1px solid #ddd', fontSize:'14px', outline:'none',
               marginBottom:'14px', minHeight:'300px', resize:'vertical',
               fontFamily:'sans-serif', lineHeight:'1.7' }
  }

  if (loading) return (
    <div style={{ textAlign:'center', padding:'4rem', color:'#666' }}>
      Loading...
    </div>
  )

  return (
    <div style={s.wrap}>
      {/* Navbar */}
      <div style={s.nav}>
        <span style={s.navL}>LOKSHANKH — Editor Panel</span>
        <div style={s.navR}>
          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>
            {user?.name}
          </span>
          <button style={s.navBtn} onClick={() => navigate('/')}>साइट पहा</button>
          <button style={s.navBtn} onClick={() => { logout(); navigate('/login') }}>
            लॉगआउट
          </button>
        </div>
      </div>

      <div style={s.body}>
        {/* Tabs */}
        <div style={s.tabs}>
          <button style={s.tab(activeTab === 'articles')}
            onClick={() => { setActiveTab('articles'); setShowForm(false) }}>
            माझे लेख ({articles.length})
          </button>
          <button style={s.tab(activeTab === 'write')}
            onClick={() => {
              setActiveTab('write')
              setShowForm(true)
              setEditingId(null)
              setForm({ title:'', content:'', excerpt:'',
                category:'', tags:'', thumbnail:'' })
            }}>
            + नवीन लेख लिहा
          </button>
        </div>

        {/* My Articles Tab */}
        {activeTab === 'articles' && (
          <div style={s.card}>
            <div style={{ fontSize:'16px', fontWeight:'600',
              marginBottom:'16px', color:'#111' }}>
              माझे सर्व लेख
            </div>
            {articles.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'#999' }}>
                <p>अजून कोणताही लेख नाही.</p>
                <button style={{ ...s.btn('red'), marginTop:'12px', padding:'8px 20px' }}
                  onClick={() => setActiveTab('write')}>
                  पहिला लेख लिहा
                </button>
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>शीर्षक</th>
                    <th style={s.th}>स्थिती</th>
                    <th style={s.th}>तारीख</th>
                    <th style={s.th}>कृती</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(a => (
                    <tr key={a._id}>
                      <td style={s.td}>
                        <div style={{ fontWeight:'500' }}>{a.title}</div>
                        <div style={{ fontSize:'11px', color:'#999', marginTop:'2px' }}>
                          {a.category?.nameMarathi || a.category?.name}
                        </div>
                      </td>
                      <td style={s.td}>{statusBadge(a.status)}</td>
                      <td style={s.td}>
                        {new Date(a.createdAt).toLocaleDateString('mr-IN')}
                      </td>
                      <td style={s.td}>
                        {a.status === 'draft' && (
                          <>
                            <button style={s.btn('blue')}
                              onClick={() => handleEdit(a)}>
                              संपादित करा
                            </button>
                            <button style={s.btn('green')}
                              onClick={() => handleSubmit(a._id)}>
                              पाठवा
                            </button>
                          </>
                        )}
                        {a.status === 'rejected' && (
                          <button style={s.btn('blue')}
                            onClick={() => handleEdit(a)}>
                            सुधारा
                          </button>
                        )}
                        {a.status === 'pending' && (
                          <span style={{ fontSize:'12px', color:'#999' }}>
                            समीक्षेत आहे...
                          </span>
                        )}
                        {a.status === 'published' && (
                          <span style={{ fontSize:'12px', color:'#0F6E56' }}>
                            ✓ प्रकाशित
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Write Article Tab */}
        {activeTab === 'write' && (
          <div style={s.card}>
            <div style={{ fontSize:'16px', fontWeight:'600',
              marginBottom:'20px', color:'#111' }}>
              {editingId ? 'लेख संपादित करा' : 'नवीन लेख लिहा'}
            </div>

            <label style={s.label}>शीर्षक *</label>
            <input style={s.input} name="title"
              value={form.title} onChange={handleChange}
              placeholder="लेखाचे शीर्षक लिहा..." />

            <label style={s.label}>विभाग *</label>
            <select style={{ ...s.input, cursor:'pointer' }}
              name="category" value={form.category} onChange={handleChange}>
              <option value="">-- विभाग निवडा --</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>
                  {c.nameMarathi || c.name}
                </option>
              ))}
            </select>

            <label style={s.label}>सारांश</label>
            <input style={s.input} name="excerpt"
              value={form.excerpt} onChange={handleChange}
              placeholder="लेखाचा छोटा सारांश (300 अक्षरे)" />

            <label style={s.label}>टॅग्स (स्वल्पविरामाने विभागा)</label>
            <input style={s.input} name="tags"
              value={form.tags} onChange={handleChange}
              placeholder="महाराष्ट्र, राजकारण, मुंबई" />

            <label style={s.label}>थंबनेल इमेज</label>
            <div style={{ marginBottom:'14px' }}>
              <input type="file" accept="image/*"
                onChange={handleImageUpload}
                style={{ fontSize:'13px', marginBottom:'8px' }} />
              {uploading && (
                <span style={{ fontSize:'12px', color:'#666' }}>
                  अपलोड होत आहे...
                </span>
              )}
              {form.thumbnail && (
                <div style={{ marginTop:'8px' }}>
                  <img src={form.thumbnail} alt="thumbnail"
                    style={{ height:'80px', borderRadius:'6px',
                      objectFit:'cover', border:'1px solid #ddd' }} />
                </div>
              )}
            </div>

            <label style={s.label}>मजकूर * </label>
            <textarea style={s.textarea} name="content"
              value={form.content} onChange={handleChange}
              placeholder="येथे लेख लिहा..." />

            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <button style={{ ...s.btn('blue'), padding:'10px 24px', fontSize:'14px' }}
                onClick={() => handleSave('draft')}>
                ड्राफ्ट सेव्ह करा
              </button>
              <button style={{ ...s.btn('green'), padding:'10px 24px', fontSize:'14px' }}
                onClick={() => handleSave('pending')}>
                समीक्षेसाठी पाठवा
              </button>
              <button style={{ ...s.btn(''), padding:'10px 24px', fontSize:'14px' }}
                onClick={() => {
                  setShowForm(false)
                  setActiveTab('articles')
                }}>
                रद्द करा
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditorDash