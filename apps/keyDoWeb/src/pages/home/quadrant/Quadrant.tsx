import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import TaskCard from './TaskCard'
import AddTaskDialog from './AddTaskDialog'
import type { Task, QuadrantType } from '@yuan-shan/keydo-contract'
import { QUADRANT_CONFIGS } from './config'
import { cn } from '@/lib/utils'

interface QuadrantProps {
  quadrantId: QuadrantType
  tasks: Task[]
  /**
   * originQuadrant: 拖拽开始时的原始象限
   * 用于判断当前拖拽是否来自本象限
   */
  originQuadrant: QuadrantType | null
  /**
   * currentOverQuadrant: 当前悬停的象限
   * 用于判断是否启用排序动画
   */
  currentOverQuadrant: QuadrantType | null
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onAddTask: (quadrant: QuadrantType, title: string) => void
}

/**
 * 象限组件
 * 
 * 功能：
 * 1. 显示象限内的任务列表
 * 2. 支持添加任务
 * 3. 支持作为拖拽目标
 * 4. 动态控制 SortableContext：
 *    - 象限内拖拽：启用排序动画
 *    - 跨象限拖拽：禁用排序动画，只高亮象限
 * 5. 任务排序：使用 LexoRank order 字段
 * 6. 任务分组显示（未完成/已完成）
 */
export default function Quadrant({
  quadrantId,
  tasks,
  originQuadrant,
  currentOverQuadrant,
  onToggleComplete,
  onDelete,
  onAddTask,
}: QuadrantProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // ========== @dnd-kit 拖拽目标功能 ==========
  
  const { setNodeRef, isOver } = useDroppable({
    id: quadrantId,
  })

  // ========== 数据处理 ==========
  
  const config = QUADRANT_CONFIGS.find((c) => c.id === quadrantId)!
  
  /**
   * 筛选未完成任务并按 order 排序
   */
  const incompleteTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed)
      .sort((a, b) => a.order.localeCompare(b.order))
  }, [tasks])

  /**
   * 筛选已完成任务并按 order 排序（保持完成前的顺序）
   */
  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.completed)
      .sort((a, b) => a.order.localeCompare(b.order))
  }, [tasks])

  /**
   * 未完成任务的 ID 列表（用于 SortableContext）
   */
  const incompleteTaskIds = useMemo(() => {
    return incompleteTasks.map((t) => t.id)
  }, [incompleteTasks])

  /**
   * 判断是否启用排序动画
   * 
   * 条件：
   * 1. 正在拖拽（originQuadrant 不为 null）
   * 2. 拖拽的任务来自本象限（originQuadrant === quadrantId）
   * 3. 当前悬停在本象限（currentOverQuadrant === quadrantId）
   * 
   * 效果：
   * - 满足条件：启用 SortableContext，任务有让位动画
   * - 不满足：禁用 SortableContext，无让位动画
   */
  const isSortingEnabled = 
    originQuadrant === quadrantId && 
    currentOverQuadrant === quadrantId

  /**
   * 判断是否为跨象限拖拽的目标象限（显示高亮效果）
   * 
   * 条件：
   * 1. 正在拖拽
   * 2. 拖拽的任务不是来自本象限
   * 3. 当前悬停在本象限
   */
  const isTargetQuadrant = 
    originQuadrant !== null && 
    originQuadrant !== quadrantId && 
    currentOverQuadrant === quadrantId

  const handleAddTaskConfirm = (title: string) => {
    onAddTask(quadrantId, title)
  }

  /**
   * 渲染任务列表
   * 根据 isSortingEnabled 决定是否使用 SortableContext
   */
  const renderTaskList = () => {
    const taskCards = incompleteTasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        hoverColor={config.hoverColor}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
      />
    ))

    if (isSortingEnabled) {
      // 启用排序：使用 SortableContext 包裹
      return (
        <SortableContext 
          items={incompleteTaskIds} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {taskCards}
          </div>
        </SortableContext>
      )
    }

    // 禁用排序：直接渲染
    return (
      <div className="space-y-2">
        {taskCards}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full rounded-xl border-2 transition-colors overflow-hidden',
        config.bgColor,
        // 跨象限拖拽目标：高亮（使用象限主题色边框）
        // 只有从其他象限拖拽过来时才显示高亮，象限内排序不高亮
        isTargetQuadrant ? [config.borderColor, 'shadow-lg'] : 'border-border'
      )}
    >
      {/* 象限头部 */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between gap-4">
        {/* 左侧：Badge + 标题 + 描述 */}
        <div className="flex items-center gap-3 min-w-0">
          <Badge className={cn('font-semibold shrink-0', config.badgeColor)}>
            {quadrantId}
          </Badge>
          <div className="min-w-0">
            <h2 className="font-semibold text-base text-foreground leading-tight">
              {config.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              {config.subtitle} · {config.description}
            </p>
          </div>
        </div>
        {/* 右侧：任务数量 + 添加按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="font-mono text-xs">
            {incompleteTasks.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 象限内容 - 自定义滚动条 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* 未完成任务列表 */}
        {incompleteTasks.length > 0 && renderTaskList()}

        {/* 已完成任务列表（不支持拖拽排序） */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">
              已完成 ({completedTasks.length})
            </div>
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                hoverColor={config.hoverColor}
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
