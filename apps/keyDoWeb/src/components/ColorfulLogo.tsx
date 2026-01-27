/**
 * 彩色 Logo 组件
 * 四象限设计，每个象限使用对应的主题色
 * 
 * 使用语义化颜色类名（定义在 index.css 中）：
 * - Q1（左上）：重要且紧急 - bg-quadrant-logo-q1（Logo 专用，更饱和）
 * - Q2（右上）：重要不紧急 - bg-quadrant-logo-q2（Logo 专用，更饱和）
 * - Q3（左下）：不重要但紧急 - bg-quadrant-logo-q3（Logo 专用，更饱和）
 * - Q4（右下）：不重要不紧急 - bg-quadrant-logo-q4（Logo 专用，更饱和）
 */

interface ColorfulLogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function ColorfulLogo({ size = 'md' }: ColorfulLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 gap-0.5',
    md: 'w-10 h-10 gap-0.5',
    lg: 'w-14 h-14 gap-1',
  }

  return (
    <div className={`grid grid-cols-2 ${sizeClasses[size]}`}>
      {/* Q1（左上）：重要且紧急 */}
      <div className="bg-quadrant-logo-q1 rounded-sm" />
      
      {/* Q2（右上）：重要不紧急 */}
      <div className="bg-quadrant-logo-q2 rounded-sm" />
      
      {/* Q3（左下）：不重要但紧急 */}
      <div className="bg-quadrant-logo-q3 rounded-sm" />
      
      {/* Q4（右下）：不重要不紧急 */}
      <div className="bg-quadrant-logo-q4 rounded-sm" />
    </div>
  )
}
