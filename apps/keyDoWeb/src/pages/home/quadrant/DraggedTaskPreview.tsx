import { FileText, Calendar, Repeat } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRoles } from '@/hooks/use-roles'
import { formatTaskDate, formatRecurrence, isOverdue } from '@/utils/dateUtils'
import { isToday } from 'date-fns'
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
 * - 显示详情图标（与 TaskCard 一致）
 */
export default function DraggedTaskPreview({ task }: DraggedTaskPreviewProps) {
  const { data: roles = [] } = useRoles()
  const role = task.roleId ? roles.find((r) => r.id === task.roleId) : null

  /**
   * 判断任务是否有详情
   */
  const hasDescription = !!task.description && task.description.trim() !== ''

  /**
   * 判断任务是否逾期和是否是今天
   */
  const isTaskOverdue = task.dueDate && !task.completed ? isOverdue(task.dueDate) : false
  const isTaskToday = task.dueDate ? isToday(new Date(task.dueDate)) : false

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

      {/* 任务内容区域 */}
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        {/* 任务标题 */}
        <span
          className={cn(
            'text-sm truncate flex-1 min-w-0',
            task.completed && 'line-through text-muted-foreground'
          )}
          title={task.title}  // hover 显示完整标题
        >
          {task.title}
        </span>

        {/* 日期徽章（单次任务） */}
        {task.dueDate && !task.recurrence && (
          <Badge
            variant="outline"
            className={cn(
              'text-xs px-1.5 py-0 shrink-0 flex items-center gap-1',
              isTaskOverdue && 'text-red-600 border-red-600',
              isTaskToday && 'text-green-600 border-green-600'
            )}
          >
            <Calendar className="h-3 w-3" />
            <span>{formatTaskDate(task.dueDate, task.isAllDay ?? true)}</span>
          </Badge>
        )}

        {/* 重复图标（重复任务） */}
        {task.recurrence && (
          <Badge
            variant="outline"
            className="text-xs px-1.5 py-0 shrink-0 flex items-center gap-1"
          >
            <Repeat className="h-3 w-3" />
            <span>
              {formatRecurrence(task.recurrence)}
              {task.dueDate && !(task.isAllDay ?? true) && (
                <> {new Date(task.dueDate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}</>
              )}
            </span>
          </Badge>
        )}

        {/* 角色标签（任何视图下都显示） */}
        {role && (
          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0 shrink-0"
            style={{
              backgroundColor: `hsl(var(--role-${role.color}-bg))`,
              color: `hsl(var(--role-${role.color}-text))`,
            }}
          >
            <span className="mr-0.5">{role.icon}</span>
            <span>{role.name}</span>
          </Badge>
        )}

        {/* 详情图标（有详情时显示） */}
        {hasDescription && (
          <span title="包含详情">
            <FileText
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-muted-foreground',
                task.completed && 'opacity-50'
              )}
            />
          </span>
        )}
      </div>
    </div>
  )
}
