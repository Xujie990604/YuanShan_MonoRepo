import { Outlet } from 'react-router-dom'
import { useCheckAuth } from '@/hooks/use-auth'

function App() {
  // 应用启动时检查登录状态
  useCheckAuth()
  
  return (
    <div className="h-screen bg-background overflow-y-auto">
      <Outlet />
    </div>
  )
}

export default App
