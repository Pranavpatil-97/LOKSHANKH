import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

import Home         from './pages/Home/Home'
import Login        from './pages/Login/Login'
import Register     from './pages/Register/Register'
import Article      from './pages/Article/Article'
import Search       from './pages/Search/Search'
import AdminDash    from './pages/Admin/AdminDash'
import EditorDash   from './pages/Editor/EditorDash'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/unauthorized"  element={<Unauthorized />} />

          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDash />
            </ProtectedRoute>
          } />

          <Route path="/editor/*" element={
            <ProtectedRoute roles={['employee', 'admin']}>
              <EditorDash />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App