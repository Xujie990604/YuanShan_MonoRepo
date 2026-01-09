import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox } from '@/components/ui/checkbox'
import TaskContextMenu from './TaskContextMenu'
import type { Task } from '@yuan-shan/keydo-contract'
import { cn } from '@/lib/utils'

/**
 * TaskCard 组件的 Props 类型定义
 */
interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * 任务卡片组件
 * 
 * 功能：
 * 1. 显示任务信息（标题、完成状态）
 * 2. 支持拖拽（使用 @dnd-kit 的 useSortable）- 仅用于跨象限拖拽
 * 3. 支持右键菜单删除
 * 4. 支持点击切换完成状态
 */
export default function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  // ========== @dnd-kit 拖拽功能 ==========
  
  /**
   * useSortable Hook：使元素可拖拽（用于跨象限拖拽）
   * 
   * 返回值说明：
   * - attributes: 需要添加到拖拽元素的 HTML 属性（如 aria-*）
   * - listeners: 拖拽事件监听器（onMouseDown 等），需要绑定到可拖拽区域
   * - setNodeRef: 设置拖拽元素的 DOM 引用
   * - transform: 拖拽时的位置变换信息（用于动画）
   * - transition: 过渡动画信息
   * - isDragging: 是否正在拖拽（boolean）
   * 
   * 参数：
   * - id: 拖拽元素的唯一标识（使用任务 ID）
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  })

  /**
   * 动态样式计算
   * 
   * 样式说明：
   * - transform: 拖拽时的位置变换（由 dnd-kit 计算）
   * - transition: 过渡动画（用于排序时的平滑移动）
   * - opacity: 拖拽时设置为半透明，让用户知道正在拖拽
   */
  const style = {
    transform: CSS.Transform.toString(transform),
    // 拖拽时禁用 transition，避免动画冲突
    transition: isDragging ? 'none' : transition,
    ...(isDragging && {
      opacity: 0.3,
    }),
  }

  return (
    <TaskContextMenu taskId={task.id} onDelete={onDelete}>
      {/* 
        任务卡片容器
        
        ref={setNodeRef}: 将 DOM 元素引用传递给 @dnd-kit
        style: 动态样式（拖拽时的位置变换和透明度）
        {...attributes}: 展开拖拽相关的 HTML 属性
      */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          'flex items-center gap-2 px-3 rounded-md bg-card border border-border',
          'hover:shadow-md transition-shadow',
          task.completed && 'opacity-60'
        )}
      >
        {/* 复选框组件 */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          onClick={(e) => e.stopPropagation()}
        />

        {/* 
          可拖拽区域（右侧剩余空间）
          {...listeners}: 将拖拽监听器绑定到这个 div 上
        */}
        <div
          {...listeners}
          className="flex-1 flex items-center h-full py-3 cursor-grab active:cursor-grabbing"
          onClick={() => {
            if (!isDragging) {
              onToggleComplete(task.id)
            }
          }}
        >
          <span
            className={cn(
              'text-sm',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
        </div>
      </div>
    </TaskContextMenu>
  )
}
