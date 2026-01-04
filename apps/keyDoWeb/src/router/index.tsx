import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/auth/login'
import SignupPage from '@/pages/auth/signup'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  // 认证路由（独立，不使用 App 布局）
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
    ],
  },
])

