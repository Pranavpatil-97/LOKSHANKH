console.log('API URL:', import.meta.env.VITE_API_URL)
import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export const authAPI = {
  login:    (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me:       ()     => API.get('/auth/me')
}

export const articlesAPI = {
  getAll:      (params) => API.get('/articles', { params }),
  getBySlug:   (slug)   => API.get(`/articles/${slug}`),
  getTrending: ()       => API.get('/articles/trending'),
  getBreaking: ()       => API.get('/articles/breaking'),
  getMyArticles: ()     => API.get('/articles/my/articles'),
  create:      (data)   => API.post('/articles', data),
  update:      (id, data) => API.put(`/articles/${id}`, data),
  submit:      (id)     => API.patch(`/articles/${id}/submit`)
}

export const adminAPI = {
  getUsers:       ()         => API.get('/admin/users'),
  updateRole:     (id, role) => API.patch(`/admin/users/${id}/role`, { role }),
  toggleUser:     (id)       => API.patch(`/admin/users/${id}/toggle`),
  getPending:     ()         => API.get('/admin/pending'),
  approveArticle: (id)       => API.patch(`/admin/articles/${id}/approve`),
  rejectArticle:  (id, reason) => API.patch(`/admin/articles/${id}/reject`, { reason }),
  deleteArticle:  (id)       => API.delete(`/admin/articles/${id}`),
  getAnalytics:   ()         => API.get('/admin/analytics'),
  getCategories:  ()         => API.get('/admin/categories'),
  getAllArticles: () => API.get('/admin/articles/all'),
  createCategory: (data)     => API.post('/admin/categories', data)
}

export const uploadAPI = {
  uploadImage: (formData) => API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
// Wake up Render backend (free tier sleeps)
export const wakeUpServer = () => {
  fetch('https://lokshankh-backend.onrender.com/') 
    .catch(() => {})
}
export default API