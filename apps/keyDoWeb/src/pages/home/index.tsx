import Sidebar from '@/components/sidebar/Sidebar'
import QuadrantContainer from './quadrant/QuadrantContainer'

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      {/* 左侧工具栏 */}
      <Sidebar />
      
      {/* 四象限任务管理区域 */}
      <div className="flex-1 overflow-hidden">
        <QuadrantContainer />
      </div>
    </div>
  )
}
