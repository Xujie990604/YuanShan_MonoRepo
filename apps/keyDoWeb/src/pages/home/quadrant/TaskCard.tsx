import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Checkbox } from '@/components/ui/checkbox'
import TaskContextMenu from './TaskContextMenu'
import type { Task } from '@yuan-shan/keydo-contract'
import { cn } from '@/lib/utils'

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
 * 2. 支持拖拽（使用 @dnd-kit 的 useSortable）
 *    - 未完成任务：可拖拽（支持排序和跨象限移动）
 *    - 已完成任务：禁用拖拽
 * 3. 支持右键菜单删除
 * 4. 点击复选框切换完成状态（只有复选框可切换，其他区域不可）
 */
export default function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
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

  return (
    <TaskContextMenu taskId={task.id} onDelete={onDelete}>
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
        {/* 复选框 */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          onClick={(e) => e.stopPropagation()}
        />

        {/* 任务内容区域（拖拽区域，不触发完成状态切换） */}
        <div
          {...(task.completed ? {} : listeners)}  // 已完成任务不绑定拖拽监听器
          className={cn(
            'flex-1 flex items-center h-full py-3',
            // 已完成任务：普通光标；未完成任务：拖拽光标
            task.completed ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          )}
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
