import { Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')
  const dispatch = useDispatch()
  const location = useLocation()

  if (!token) {
    dispatch(logout())
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
