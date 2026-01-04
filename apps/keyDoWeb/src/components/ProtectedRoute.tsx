/**
 * 路由守卫组件
 * 未登录用户自动跳转到登录页
 */
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token)
  
  if (!token) {
    return <Navigate to="/auth/login" replace />
  }
  
  return <>{children}</>
}
