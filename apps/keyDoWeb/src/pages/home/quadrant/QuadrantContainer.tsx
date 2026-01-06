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
   * activeTask: 当前正在拖拽的任务（用于 DragOverlay 显示）
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
   * 只记录当前拖拽的任务，用于 DragOverlay 显示
   */
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  /**
   * 拖拽结束事件处理
   * 
   * 核心逻辑：
   * 1. 从原始 tasks 获取 draggedTask（最可靠的数据源）
   * 2. 通过 over.id 判定最终落点象限
   * 3. 严格区分跨象限和同象限排序，一次只做一件事
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const draggedTask = tasks.find((t) => t.id === taskId)
    if (!draggedTask) return

    // 1. 确定最终落点象限（如果是任务 ID 则找其 quadrant）
    const isContainer = QUADRANT_CONFIGS.some((c) => c.id === over.id)
    const finalQuadrant = isContainer 
      ? (over.id as QuadrantType) 
      : tasks.find((t) => t.id === over.id)?.quadrant

    if (!finalQuadrant) return

    // 2. 逻辑分路
    if (draggedTask.quadrant !== finalQuadrant) {
      // 跨象限：只需发送 quadrant，后端自动处理排在末尾
      updateTaskMutation.mutate({
        id: taskId,
        data: { quadrant: finalQuadrant },
      })
    } else if (!isContainer && active.id !== over.id) {
      // 同象限：且拖拽到了具体任务上，处理排序
      const targetTaskId = over.id as string
      
      // 获取当前象限内排好序的非完成任务
      const quadrantTasks = tasks
        .filter((t) => t.quadrant === finalQuadrant && !t.completed)
        .sort((a, b) => a.order.localeCompare(b.order))

      const draggedIndex = quadrantTasks.findIndex((t) => t.id === taskId)
      const targetIndex = quadrantTasks.findIndex((t) => t.id === targetTaskId)

      if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        // 计算新的 LexoRank
        let newOrder: string
        if (targetIndex === 0) {
          newOrder = getRankBetween(null, quadrantTasks[0].order)
        } else if (targetIndex === quadrantTasks.length - 1) {
          newOrder = getRankBetween(quadrantTasks[quadrantTasks.length - 1].order, null)
        } else {
          // 移动到中间：取目标位置的前一个和后一个任务的 order
          const prevTask = quadrantTasks[targetIndex - 1]
          const nextTask = quadrantTasks[targetIndex]
          newOrder = getRankBetween(prevTask.order, nextTask.order)
        }

        // 持久化排序
        updateTaskMutation.mutate({
          id: taskId,
          data: { order: newOrder },
        })
      }
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
