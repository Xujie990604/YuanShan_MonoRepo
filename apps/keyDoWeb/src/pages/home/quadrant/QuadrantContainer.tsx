import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import Quadrant from './Quadrant'
import type { Task, QuadrantType } from '@yuan-shan/keydo-contract'
import { QUADRANT_CONFIGS } from './config'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { getRankBetween } from '@yuan-shan/tools'

/**
 * 四象限任务管理容器组件
 * 
 * 功能：
 * 1. 使用 TanStack Query 管理任务数据
 * 2. 处理任务的增删改查（通过 API）
 * 3. 实现拖拽功能（使用 @dnd-kit）
 * 4. 支持象限内任务排序（lexorank）
 */
export default function QuadrantContainer() {
  // ========== TanStack Query：数据获取 ==========
  
  /**
   * 获取任务列表
   */
  const { data: tasks = [], isLoading, error } = useTasks()
  
  /**
   * Mutations：任务操作
   */
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  // ========== 拖拽状态 ==========
  
  /**
   * activeTask: 当前正在拖拽的任务
   */
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // ========== 任务操作方法 ==========
  
  /**
   * 切换任务完成状态
   */
  const handleToggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    updateTaskMutation.mutate({
      id,
      data: {
        completed: !task.completed,
      },
    })
  }

  /**
   * 删除任务
   */
  const handleDelete = (id: string) => {
    deleteTaskMutation.mutate(id)
  }

  /**
   * 添加新任务
   */
  const handleAddTask = (quadrant: QuadrantType, title: string) => {
    createTaskMutation.mutate({
      title,
      quadrant,
      // order 不提供，由服务端计算
    })
  }

  // ========== 拖拽功能处理 ==========
  
  /**
   * 拖拽开始事件处理
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  /**
   * 拖拽结束事件处理
   * 
   * 处理逻辑：
   * 1. 跨象限拖拽：更新任务的 quadrant（order 由服务端计算）
   * 2. 象限内排序：计算新的 order 值并更新
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const draggedTask = tasks.find((t) => t.id === taskId)
    if (!draggedTask) return

    // 判断 over.id 是象限 ID 还是任务 ID
    const isQuadrantId = QUADRANT_CONFIGS.some((config) => config.id === over.id)
    
    if (isQuadrantId) {
      // 情况1：拖拽到象限上（跨象限拖拽）
      const targetQuadrant = over.id as QuadrantType
      
      if (draggedTask.quadrant !== targetQuadrant) {
        // 象限改变，更新象限（order 由服务端计算）
        updateTaskMutation.mutate({
          id: taskId,
          data: {
            quadrant: targetQuadrant,
          },
        })
      }
    } else {
      // 情况2：拖拽到任务上（象限内排序）
      const targetTaskId = over.id as string
      const targetTask = tasks.find((t) => t.id === targetTaskId)
      
      if (!targetTask) return
      
      // 必须是同一象限内的排序
      if (draggedTask.quadrant !== targetTask.quadrant) {
        // 如果象限不同，按跨象限处理
        updateTaskMutation.mutate({
          id: taskId,
          data: {
            quadrant: targetTask.quadrant,
          },
        })
        return
      }

      // 同一象限内排序：计算新的 order 值
      const quadrantTasks = tasks
        .filter((t) => t.quadrant === draggedTask.quadrant && !t.completed)
        .sort((a, b) => a.order.localeCompare(b.order))

      const draggedIndex = quadrantTasks.findIndex((t) => t.id === taskId)
      const targetIndex = quadrantTasks.findIndex((t) => t.id === targetTaskId)

      // 如果位置没变，不需要更新
      if (draggedIndex === targetIndex) return

      // 计算新的 order 值
      let newOrder: string

      if (targetIndex === 0) {
        // 移动到最前面
        const firstTask = quadrantTasks[0]
        newOrder = getRankBetween(null, firstTask.order)
      } else if (targetIndex === quadrantTasks.length - 1) {
        // 移动到最后面
        const lastTask = quadrantTasks[quadrantTasks.length - 1]
        newOrder = getRankBetween(lastTask.order, null)
      } else {
        // 移动到中间
        const prevTask = quadrantTasks[targetIndex - 1]
        const nextTask = quadrantTasks[targetIndex]
        newOrder = getRankBetween(prevTask.order, nextTask.order)
      }

      // 更新任务的 order
      updateTaskMutation.mutate({
        id: taskId,
        data: {
          order: newOrder,
        },
      })
    }
  }

  /**
   * 按象限筛选任务
   */
  const getTasksByQuadrant = (quadrantId: QuadrantType) => {
    return tasks.filter((task) => task.quadrant === quadrantId)
  }

  // ========== 加载和错误状态 ==========
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-destructive">
          加载失败：{(error as any)?.message || '未知错误'}
        </div>
      </div>
    )
  }

  // ========== 渲染组件 ==========
  
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
        {QUADRANT_CONFIGS.map((config) => (
          <Quadrant
            key={config.id}
            quadrantId={config.id}
            tasks={getTasksByQuadrant(config.id)}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="flex items-center gap-2 p-3 rounded-md bg-card border border-border shadow-lg opacity-90">
            <Checkbox checked={activeTask.completed} disabled />
            <span
              className={cn(
                'text-sm',
                activeTask.completed && 'line-through text-muted-foreground'
              )}
            >
              {activeTask.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
