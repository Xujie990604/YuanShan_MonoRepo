import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Task } from '@yuan-shan/keydo-contract'

/**
 * DraggedTaskPreview 组件的 Props 类型定义
 */
interface DraggedTaskPreviewProps {
  task: Task
}

/**
 * 拖拽任务预览组件
 * 
 * 用途：
 * - 在 DragOverlay 中显示正在拖拽的任务预览
 * - 与 TaskCard 保持一致的样式风格
 * 
 * 样式说明：
 * - 复用 TaskCard 的基础样式
 * - 添加阴影和轻微透明度，突出"正在拖拽"的视觉效果
 * - 禁用交互（Checkbox 为 disabled）
 */
export default function DraggedTaskPreview({ task }: DraggedTaskPreviewProps) {
  return (
    <div
      className={cn(
        // 基础样式（与 TaskCard 保持一致）
        'flex items-center gap-2 px-3 py-3 rounded-md bg-card border border-border',
        // 拖拽状态样式
        'shadow-lg opacity-90',
        // 完成状态样式
        task.completed && 'opacity-70'
      )}
    >
      {/* 复选框（禁用状态，仅用于显示） */}
      <Checkbox checked={task.completed} disabled />

      {/* 任务标题 */}
      <span
        className={cn(
          'text-sm',
          task.completed && 'line-through text-muted-foreground'
        )}
      >
        {task.title}
      </span>
    </div>
  )
}
