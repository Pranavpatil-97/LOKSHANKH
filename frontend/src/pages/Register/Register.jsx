import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Register = () => {
  const [form, setForm]       = useState({ name:'', email:'', password:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f5',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', padding:'2rem', borderRadius:'12px',
        border:'1px solid #e5e5e5', width:'100%', maxWidth:'400px' }}>

        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <h1 style={{ color:'#B91C1C', fontSize:'22px', fontWeight:'600' }}>
            LOKSHANKH
          </h1>
          <p style={{ color:'#666', fontSize:'14px', marginTop:'4px' }}>
            नवीन खाते तयार करा
          </p>
        </div>

        {error && (
          <div style={{ background:'#FEF2F2', border:'1px solid #FECACA',
            color:'#B91C1C', padding:'10px 14px', borderRadius:'8px',
            fontSize:'13px', marginBottom:'1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:'13px', fontWeight:'500',
              display:'block', marginBottom:'6px' }}>पूर्ण नाव</label>
            <input
              type="text" name="name"
              value={form.name} onChange={handleChange}
              required placeholder="तुमचे नाव"
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                border:'1px solid #ddd', fontSize:'14px', outline:'none' }}
            />
          </div>

          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:'13px', fontWeight:'500',
              display:'block', marginBottom:'6px' }}>Email</label>
            <input
              type="email" name="email"
              value={form.email} onChange={handleChange}
              required placeholder="your@email.com"
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                border:'1px solid #ddd', fontSize:'14px', outline:'none' }}
            />
          </div>

          <div style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontSize:'13px', fontWeight:'500',
              display:'block', marginBottom:'6px' }}>Password</label>
            <input
              type="password" name="password"
              value={form.password} onChange={handleChange}
              required placeholder="किमान 6 अक्षरे"
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                border:'1px solid #ddd', fontSize:'14px', outline:'none' }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{ width:'100%', padding:'11px', background:'#B91C1C',
              color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px',
              fontWeight:'500', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1 }}>
            {loading ? 'नोंदणी होत आहे...' : 'नोंदणी करा'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'13px',
          color:'#666', marginTop:'1.5rem' }}>
          आधीच खाते आहे?{' '}
          <Link to="/login" style={{ color:'#B91C1C', fontWeight:'500' }}>
            लॉगिन करा
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register