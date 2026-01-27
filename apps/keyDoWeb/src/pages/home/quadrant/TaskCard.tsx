import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileText } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import TaskContextMenu from './TaskContextMenu'
import type { Task } from '@yuan-shan/keydo-contract'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  hoverColor?: string  // 象限对应的 hover 背景色
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void  // 编辑回调
}

/**
 * 任务卡片组件
 * 
 * 功能：
 * 1. 显示任务信息（标题、完成状态、详情图标）
 * 2. 支持拖拽（使用 @dnd-kit 的 useSortable）
 *    - 未完成任务：可拖拽（支持排序和跨象限移动）
 *    - 已完成任务：禁用拖拽
 * 3. 支持右键菜单（编辑、删除）
 * 4. 点击复选框切换完成状态（只有复选框可切换，其他区域不可）
 * 5. 有详情的任务显示图标区分
 */
export default function TaskCard({ task, hoverColor, onToggleComplete, onDelete, onEdit }: TaskCardProps) {
  /**
   * useSortable Hook：使元素可拖拽
   * 
   * disabled: 已完成任务禁用拖拽
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
    disabled: task.completed,  // 已完成任务禁用拖拽
  })

  /**
   * 动态样式计算
   */
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    ...(isDragging && {
      opacity: 0.3,
    }),
  }

  /**
   * 判断任务是否有详情
   */
  const hasDescription = !!task.description && task.description.trim() !== ''

  /**
   * 点击处理（仅未完成任务支持编辑）
   * 已完成任务不允许编辑
   */
  const handleClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发其他事件
    e.stopPropagation()
    
    // 已完成任务不允许编辑
    if (task.completed) return
    
    // 拖拽未激活时触发编辑
    if (!isDragging) {
      onEdit(task)
    }
  }

  return (
    <TaskContextMenu
      task={task}
      onEdit={onEdit}
      onDelete={onDelete}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          'flex items-center gap-2 px-3 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50',
          'transition-all',
          hoverColor,  // 应用象限对应的 hover 背景色
          task.completed && 'opacity-60'
        )}
      >
        {/* 复选框 */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          onClick={(e) => e.stopPropagation()}
        />

        {/* 任务内容区域（拖拽区域，不触发完成状态切换） */}
        <div
          {...(task.completed ? {} : listeners)}  // 已完成任务不绑定拖拽监听器
          onClick={handleClick}  // 点击事件（仅未完成任务支持编辑）
          className={cn(
            'flex-1 flex items-center gap-1.5 h-full py-3 min-w-0',  // min-w-0 允许 flex 子元素收缩，gap-1.5 为图标留出间距
            // 已完成任务：普通光标；未完成任务：可点击光标
            task.completed ? 'cursor-default' : 'cursor-pointer'
          )}
        >
          <span
            className={cn(
              'text-sm truncate flex-1 min-w-0',  // truncate 单行省略，flex-1 占据剩余空间
              task.completed && 'line-through text-muted-foreground'
            )}
            title={task.title}  // hover 显示完整标题
          >
            {task.title}
          </span>
          
          {/* 详情图标（有详情时显示） */}
          {hasDescription && (
            <FileText
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-muted-foreground',
                task.completed && 'opacity-50'
              )}
              title="包含详情"
            />
          )}
        </div>
      </div>
    </TaskContextMenu>
  )
}
