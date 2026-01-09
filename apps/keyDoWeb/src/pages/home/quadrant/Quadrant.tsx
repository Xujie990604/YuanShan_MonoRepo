import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TaskCard from './TaskCard'
import AddTaskDialog from './AddTaskDialog'
import type { Task, QuadrantType } from '@yuan-shan/keydo-contract'
import { QUADRANT_CONFIGS } from './config'
import { cn } from '@/lib/utils'

interface QuadrantProps {
  quadrantId: QuadrantType
  tasks: Task[]
  /**
   * isHighlighted: 是否高亮显示此象限
   * 
   * 用途：
   * - 在跨象限拖拽时，高亮显示目标象限
   * - 提供视觉反馈，让用户清楚知道任务将被放置到哪个象限
   */
  isHighlighted?: boolean
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onAddTask: (quadrant: QuadrantType, title: string) => void
}

/**
 * 象限组件
 * 
 * 功能：
 * 1. 显示象限内的任务列表
 * 2. 支持添加任务（带表单验证）
 * 3. 支持作为拖拽目标（使用 @dnd-kit 的 useDroppable）- 仅支持跨象限拖拽
 * 4. 任务排序：按创建时间排序（createdAt）
 * 5. 任务分组显示（未完成/已完成）
 */
export default function Quadrant({
  quadrantId,
  tasks,
  isHighlighted = false,
  onToggleComplete,
  onDelete,
  onAddTask,
}: QuadrantProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // ========== @dnd-kit 拖拽目标功能 ==========
  
  /**
   * useDroppable Hook：使象限可以作为拖拽目标
   * - 用于跨象限拖拽
   */
  const { setNodeRef, isOver } = useDroppable({
    id: quadrantId,
  })

  // ========== 数据处理 ==========
  
  const config = QUADRANT_CONFIGS.find((c) => c.id === quadrantId)!
  
  /**
   * 筛选未完成任务并按创建时间排序
   */
  const incompleteTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [tasks])

  /**
   * 筛选已完成任务并按创建时间排序
   */
  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.completed)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [tasks])

  /**
   * 处理添加任务确认
   */
  const handleAddTaskConfirm = (title: string) => {
    onAddTask(quadrantId, title)
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full rounded-lg border border-border',
        config.bgColor,
        // 高亮状态：跨象限拖拽时的目标象限高亮
        // 使用更强的视觉效果，区别于普通的 isOver 状态
        isHighlighted && 'ring-4 ring-primary ring-inset shadow-lg',
        // 普通悬停状态：只在非高亮时显示
        !isHighlighted && isOver && 'ring-2 ring-primary ring-inset'
      )}
    >
      {/* 象限头部 */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{quadrantId}</span>
          <span className="text-sm text-muted-foreground">{config.label}</span>
          <span className="text-xs text-muted-foreground">({incompleteTasks.length})</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 象限内容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 未完成任务列表（按创建时间排序） */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-2">
            {incompleteTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {/* 已完成任务列表（不支持排序，只显示） */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">
              已完成 ({completedTasks.length})
            </div>
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            暂无任务
          </div>
        )}
      </div>

      {/* 添加任务对话框 */}
      <AddTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleAddTaskConfirm}
      />
    </div>
  )
}
