import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const AdminGuard = ({ children }) => {
  const { isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not admin and not loading
    if (!loading && !isAdmin) {
      navigate('/dashboard')
    }
  }, [isAdmin, loading, navigate])

  // Show nothing while loading or if not admin (redirect will happen)
  if (loading || !isAdmin) {
    return null
  }

  return children
}

export default AdminGuard
