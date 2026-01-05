import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox } from '@/components/ui/checkbox'
import TaskContextMenu from './TaskContextMenu'
import type { Task } from '@yuan-shan/keydo-contract'
import { cn } from '@/lib/utils'

/**
 * TaskCard 组件的 Props 类型定义
 * - task: 任务数据对象
 * - onToggleComplete: 切换完成状态的回调函数（接收任务 ID）
 * - onDelete: 删除任务的回调函数（接收任务 ID）
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
 * 2. 支持拖拽（使用 @dnd-kit 的 useDraggable）
 * 3. 支持右键菜单删除
 * 4. 支持点击切换完成状态
 */
export default function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  // ========== @dnd-kit 拖拽功能 ==========
  
  /**
   * useDraggable Hook：使元素可拖拽
   * 
   * 返回值说明：
   * - attributes: 需要添加到拖拽元素的 HTML 属性（如 aria-*）
   * - listeners: 拖拽事件监听器（onMouseDown 等），需要绑定到可拖拽区域
   * - setNodeRef: 设置拖拽元素的 DOM 引用
   * - transform: 拖拽时的位置变换信息（用于动画）
   * - isDragging: 是否正在拖拽（boolean）
   * 
   * 参数：
   * - id: 拖拽元素的唯一标识（用于识别被拖拽的元素）
   */
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,  // 使用任务 ID 作为拖拽标识
  })

  /**
   * 动态样式计算
   * - 拖拽时：设置透明度为 0.3（半透明效果）
   * - 非拖拽时：应用 transform（位置变换，虽然这里通常为空）
   * 
   * CSS.Translate.toString(transform):
   * - 将 @dnd-kit 的 transform 对象转换为 CSS transform 字符串
   * - 例如：{ x: 10, y: 20 } => "translate3d(10px, 20px, 0)"
   */
  const style = isDragging
    ? {
        // 拖拽时：原卡片半透明显示（30% 透明度）
        opacity: 0.3,
      }
    : {
        // 非拖拽时：应用位置变换（虽然这里通常为空）
        transform: CSS.Translate.toString(transform),
      }

  return (
    <TaskContextMenu taskId={task.id} onDelete={onDelete}>
      {/* 
        任务卡片容器
        
        ref={setNodeRef}: 将 DOM 元素引用传递给 @dnd-kit，@dnd-kit 需要这个引用来管理拖拽
        {...attributes}: 展开 attributes 对象，添加无障碍属性（aria-*），这是 @dnd-kit 要求的
        {...listeners}: 注意：listeners 只绑定在任务标题上，不在整个卡片上，这样复选框可以正常点击
      */}
      <div
        ref={setNodeRef} // 设置拖拽元素的 DOM 引用
        style={style} // 动态样式（拖拽时的透明度）
        {...attributes} // 展开拖拽相关的 HTML 属性
        className={cn(
          'flex items-center gap-2 p-3 rounded-md bg-card border border-border',
          'hover:shadow-md transition-shadow', // 悬停时显示阴影
          task.completed && 'opacity-60' // 已完成任务降低透明度
        )}
      >
        {/* 复选框组件：checked 绑定完成状态，onCheckedChange 触发切换，stopPropagation 阻止事件冒泡 */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
        />

        {/* 
          任务标题（可拖拽区域）
          {...listeners}: 将拖拽监听器绑定在标题上，只有这个区域可以拖拽
          cursor-grab/grabbing: 鼠标悬停/拖拽时显示"抓取"光标
        */}
        <span
          {...listeners} // 拖拽监听器（只绑定在标题上）
          className={cn(
            'flex-1 text-sm cursor-grab active:cursor-grabbing', // 可拖拽样式
            task.completed && 'line-through text-muted-foreground' // 已完成样式
          )}
          onClick={() => {
            // 如果是在拖拽过程中，不触发完成切换
            // 避免拖拽时误触完成切换
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
