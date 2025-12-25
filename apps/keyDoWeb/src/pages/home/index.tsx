import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-8">
        {/* 标题 */}
        <h1 className="text-4xl font-bold">KeyDo Web</h1>
        
        {/* 计数显示 */}
        <div className="text-6xl font-bold text-primary">{count}</div>

        {/* 按钮组 */}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setCount(count + 1)}>
            增加
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCount(count - 1)}
          >
            减少
          </Button>
          <Button
            variant="outline"
            onClick={() => setCount(0)}
          >
            重置
          </Button>
        </div>
        
        {/* 导航到登录页 */}
        <div className="pt-4">
          <Link to="/auth/login">
            <Button variant="outline">
              前往登录页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
