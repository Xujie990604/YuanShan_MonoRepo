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
 * 2. 支持拖拽和排序（使用 @dnd-kit 的 useSortable）
 * 3. 支持右键菜单删除
 * 4. 支持点击切换完成状态
 */
export default function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  // ========== @dnd-kit 排序功能 ==========
  
  /**
   * useSortable Hook：使元素可拖拽和排序
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
   * - 拖拽时：设置透明度为 0.3（半透明效果）
   * - 非拖拽时：应用 transform（位置变换，用于排序动画）
   * 
   * CSS.Translate.toString(transform):
   * - 将 @dnd-kit 的 transform 对象转换为 CSS transform 字符串
   */
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
          'flex items-center gap-2 p-3 rounded-md bg-card border border-border',
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
          任务标题（可拖拽区域）
          {...listeners}: 将拖拽监听器绑定在标题上，只有这个区域可以拖拽
        */}
        <span
          {...listeners}
          className={cn(
            'flex-1 text-sm cursor-grab active:cursor-grabbing',
            task.completed && 'line-through text-muted-foreground'
          )}
          onClick={() => {
            if (!isDragging) {
              onToggleComplete(task.id)
            }
          }}
        >
          {task.title}
        </span>
      </div>
    </TaskContextMenu>
  )
}
