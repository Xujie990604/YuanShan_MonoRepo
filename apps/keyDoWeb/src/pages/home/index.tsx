import Sidebar from '@/components/sidebar/Sidebar'
import RoleFocusBanner from '@/components/role/RoleFocusBanner'
import QuadrantContainer from './quadrant/QuadrantContainer'

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      {/* 左侧工具栏 */}
      <Sidebar />
      
      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 角色聚焦 Banner */}
        <RoleFocusBanner />
        
        {/* 四象限任务管理区域 */}
        <div className="flex-1 overflow-hidden">
          <QuadrantContainer />
        </div>
      </div>
    </div>
  )
}
