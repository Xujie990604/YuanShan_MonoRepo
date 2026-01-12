/**
 * 彩色 Logo 组件
 * 四象限设计，每个象限使用对应的主题色
 * 
 * 颜色对应：
 * - Q1（左上）：玫瑰红 - 重要且紧急
 * - Q2（右上）：琥珀色 - 重要不紧急
 * - Q3（左下）：蓝色 - 不重要但紧急
 * - Q4（右下）：翠绿色 - 不重要不紧急
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
      {/* Q1（左上）：玫瑰红 - 重要且紧急 */}
      <div className="bg-rose-500 rounded-sm" />
      
      {/* Q2（右上）：琥珀色 - 重要不紧急 */}
      <div className="bg-amber-500 rounded-sm" />
      
      {/* Q3（左下）：蓝色 - 不重要但紧急 */}
      <div className="bg-blue-500 rounded-sm" />
      
      {/* Q4（右下）：翠绿色 - 不重要不紧急 */}
      <div className="bg-emerald-500 rounded-sm" />
    </div>
  )
}
