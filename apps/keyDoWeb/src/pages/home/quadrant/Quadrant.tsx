import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import TaskCard from './TaskCard'
import AddTaskDialog from './AddTaskDialog'
import type { Task, QuadrantType } from '@/types/task'
import { QUADRANT_CONFIGS } from '@/types/task'
import { cn } from '@/lib/utils'

interface QuadrantProps {
  quadrantId: QuadrantType
  tasks: Task[]
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
 * 3. 支持作为拖拽目标（使用 @dnd-kit 的 useDroppable）
 * 4. 任务分组显示（未完成/已完成）
 */
export default function Quadrant({
  quadrantId,
  tasks,
  onToggleComplete,
  onDelete,
  onAddTask,
}: QuadrantProps) {
  // ========== React Hooks：组件内部状态 ==========
  
  /**
   * isDialogOpen: 控制添加任务对话框的显示/隐藏
   */
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // ========== @dnd-kit 拖拽目标功能 ==========
  
  /**
   * useDroppable Hook：使元素可以作为拖拽目标
   * 
   * 返回值说明：
   * - setNodeRef: 设置拖拽目标的 DOM 引用
   * - isOver: 是否有元素正在拖拽到此目标上方（boolean）
   * 
   * 参数：
   * - id: 拖拽目标的唯一标识（使用象限 ID）
   * 
   * 作用：
   * - 当任务拖拽到此象限上方时，isOver 为 true
   * - 可以用于显示高亮效果
   */
  const { setNodeRef, isOver } = useDroppable({
    id: quadrantId,  // 使用象限 ID 作为拖拽目标标识
  })

  // ========== 数据处理 ==========
  
  /**
   * 查找象限配置信息（背景色、标签等）
   * 
   * find 方法：查找数组中第一个满足条件的元素
   * ! 操作符：TypeScript 非空断言，表示结果一定不为 undefined
   */
  const config = QUADRANT_CONFIGS.find((c) => c.id === quadrantId)!
  
  /**
   * 筛选未完成任务
   * filter 方法：返回新数组，只包含 completed 为 false 的任务
   */
  const incompleteTasks = tasks.filter((t) => !t.completed)
  
  /**
   * 筛选已完成任务
   * filter 方法：返回新数组，只包含 completed 为 true 的任务
   */
  const completedTasks = tasks.filter((t) => t.completed)

  /**
   * 处理添加任务确认
   * 
   * @param title 任务标题
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
        isOver && 'ring-2 ring-primary ring-inset'
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
        {/* 未完成任务 */}
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

        {/* 已完成任务 */}
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
