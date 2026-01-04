/**
 * Logo 组件
 * 四象限设计
 */
export default function Logo() {
  return (
    <div className="w-14 h-14 grid grid-cols-2 gap-1">
      
      {/* 第一象限：最深的颜色 */}
      <div className="bg-foreground rounded-sm" />
      
      {/* 第二象限：60% 透明度 */}
      <div className="bg-foreground/60 rounded-sm" />
      
      {/* 第三象限：30% 透明度 */}
      <div className="bg-foreground/30 rounded-sm" />
      
      {/* 第四象限：10% 透明度 */}
      <div className="bg-foreground/10 rounded-sm" />
    </div>
  )
}
