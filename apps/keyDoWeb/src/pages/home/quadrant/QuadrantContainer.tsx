import { useState, useMemo } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import { getRankBetween } from '@yuan-shan/tools'
import Quadrant from './Quadrant'
import DraggedTaskPreview from './DraggedTaskPreview'
import type { Task, QuadrantType } from '@yuan-shan/keydo-contract'
import { QUADRANT_CONFIGS } from './config'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks'
import { queryKeys } from '@/hooks/query-keys'

/**
 * 四象限任务管理容器组件
 * 
 * 功能：
 * 1. 使用 TanStack Query 管理任务数据
 * 2. 处理任务的增删改查（通过 API）
 * 3. 实现拖拽功能（使用 @dnd-kit）
 *    - 象限内拖拽：支持排序（有让位动画）
 *    - 跨象限拖拽：任务移动到目标象限底部（无让位动画）
 * 4. 任务排序：使用 LexoRank order 字段
 */
export default function QuadrantContainer() {
  // ========== TanStack Query：数据获取 ==========
  
  const { data: tasks = [], isLoading, error } = useTasks()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const queryClient = useQueryClient()

  // ========== 拖拽状态 ==========
  
  /**
   * activeTask: 当前正在拖拽的任务（用于 DragOverlay 显示）
   */
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  /**
   * originQuadrant: 拖拽开始时的原始象限
   * 用于判断是「象限内排序」还是「跨象限拖拽」
   */
  const [originQuadrant, setOriginQuadrant] = useState<QuadrantType | null>(null)

  /**
   * currentOverQuadrant: 当前悬停的象限
   * 用于动态控制 SortableContext 的启用/禁用
   */
  const [currentOverQuadrant, setCurrentOverQuadrant] = useState<QuadrantType | null>(null)

  // ========== 任务操作方法（带乐观更新） ==========
  
  /**
   * 切换任务完成状态（带乐观更新）
   */
  const handleToggleComplete = (id: string) => {
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    const task = currentTasks.find((t) => t.id === id)
    if (!task) return

    const originalCompleted = task.completed
    
    queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
      return oldTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    })

    updateTaskMutation.mutate(
      { id, data: { completed: !task.completed } },
      {
        onError: () => {
          queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
            return oldTasks.map((t) =>
              t.id === id ? { ...t, completed: originalCompleted } : t
            )
          })
        },
      }
    )
  }

  /**
   * 删除任务（带乐观更新）
   */
  const handleDelete = (id: string) => {
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    const deletedTask = currentTasks.find((t) => t.id === id)
    if (!deletedTask) return
    
    queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
      return oldTasks.filter((t) => t.id !== id)
    })

    deleteTaskMutation.mutate(id, {
      onError: () => {
        queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
          if (oldTasks.some((t) => t.id === id)) return oldTasks
          return [...oldTasks, deletedTask]
        })
      },
    })
  }

  /**
   * 添加新任务（order 由服务端计算）
   */
  const handleAddTask = (quadrant: QuadrantType, title: string) => {
    createTaskMutation.mutate({ title, quadrant })
  }

  // ========== 拖拽功能处理 ==========
  
  /**
   * 拖拽开始事件
   */
  const handleDragStart = (event: DragStartEvent) => {
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    const task = currentTasks.find((t) => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
      setOriginQuadrant(task.quadrant)
      setCurrentOverQuadrant(task.quadrant)
    }
  }

  /**
   * 拖拽过程中事件
   * 用于追踪当前悬停的象限，控制 SortableContext 的启用/禁用
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setCurrentOverQuadrant(null)
      return
    }

    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    
    // 判断悬停目标是象限容器还是任务
    const isContainer = QUADRANT_CONFIGS.some((c) => c.id === over.id)
    const overQuadrant = isContainer 
      ? (over.id as QuadrantType) 
      : currentTasks.find((t) => t.id === over.id)?.quadrant

    if (overQuadrant) {
      setCurrentOverQuadrant(overQuadrant)
    }
  }

  /**
   * 拖拽结束事件
   * 
   * 核心逻辑：
   * 1. 判断是「象限内排序」还是「跨象限拖拽」
   * 2. 计算新的 order 值
   * 3. 乐观更新 + API 请求
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // 清除拖拽状态
    setActiveTask(null)
    setOriginQuadrant(null)
    setCurrentOverQuadrant(null)

    if (!over) return

    const taskId = active.id as string
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    const draggedTask = currentTasks.find((t) => t.id === taskId)
    
    if (!draggedTask) return

    // 判断目标位置
    const isContainer = QUADRANT_CONFIGS.some((c) => c.id === over.id)
    const finalQuadrant = isContainer 
      ? (over.id as QuadrantType) 
      : currentTasks.find((t) => t.id === over.id)?.quadrant

    if (!finalQuadrant) return

    // 获取目标象限的未完成任务列表（按 order 排序）
    const targetQuadrantTasks = currentTasks
      .filter((t) => t.quadrant === finalQuadrant && !t.completed && t.id !== taskId)
      .sort((a, b) => a.order.localeCompare(b.order))

    if (draggedTask.quadrant === finalQuadrant) {
      // ========== 象限内排序 ==========
      handleIntraQuadrantSort(taskId, draggedTask, over.id as string, targetQuadrantTasks, currentTasks)
    } else {
      // ========== 跨象限拖拽 ==========
      handleCrossQuadrantMove(taskId, draggedTask, finalQuadrant, targetQuadrantTasks)
    }
  }

  /**
   * 处理象限内排序
   */
  const handleIntraQuadrantSort = (
    taskId: string,
    draggedTask: Task,
    overId: string,
    targetQuadrantTasks: Task[],
    currentTasks: Task[]
  ) => {
    // 如果拖到自己身上，不处理
    if (taskId === overId) return

    // 如果拖到象限容器上（而不是具体任务），放到末尾
    const isContainer = QUADRANT_CONFIGS.some((c) => c.id === overId)
    
    let newOrder: string
    let newTaskList: Task[]

    if (isContainer) {
      // 放到末尾
      const lastTask = targetQuadrantTasks[targetQuadrantTasks.length - 1]
      newOrder = lastTask ? getRankBetween(lastTask.order, null) : draggedTask.order
      
      newTaskList = currentTasks.map((t) =>
        t.id === taskId ? { ...t, order: newOrder } : t
      )
    } else {
      // 放到具体任务的位置
      const overTask = currentTasks.find((t) => t.id === overId)
      if (!overTask) return

      // 获取本象限所有未完成任务（包含被拖拽的任务）
      const allQuadrantTasks = currentTasks
        .filter((t) => t.quadrant === draggedTask.quadrant && !t.completed)
        .sort((a, b) => a.order.localeCompare(b.order))
      
      const actualOverIndex = allQuadrantTasks.findIndex((t) => t.id === overId)
      const actualDraggedIndex = allQuadrantTasks.findIndex((t) => t.id === taskId)

      if (actualOverIndex === -1 || actualDraggedIndex === -1) return
      if (actualOverIndex === actualDraggedIndex) return

      // 计算新的 order
      // 如果向下移动（draggedIndex < overIndex），插入到 over 之后
      // 如果向上移动（draggedIndex > overIndex），插入到 over 之前
      if (actualDraggedIndex < actualOverIndex) {
        // 向下移动：插入到 over 之后
        const nextTask = allQuadrantTasks[actualOverIndex + 1]
        newOrder = getRankBetween(overTask.order, nextTask?.order || null)
      } else {
        // 向上移动：插入到 over 之前
        const prevTask = allQuadrantTasks[actualOverIndex - 1]
        newOrder = getRankBetween(prevTask?.order || null, overTask.order)
      }

      newTaskList = currentTasks.map((t) =>
        t.id === taskId ? { ...t, order: newOrder } : t
      )
    }

    // 保存原始值用于回滚
    const originalOrder = draggedTask.order

    // 乐观更新
    queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), newTaskList!)

    // API 请求
    updateTaskMutation.mutate(
      { id: taskId, data: { order: newOrder! } },
      {
        onError: () => {
          queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
            return oldTasks.map((t) =>
              t.id === taskId ? { ...t, order: originalOrder } : t
            )
          })
        },
      }
    )
  }

  /**
   * 处理跨象限拖拽
   * 任务移动到目标象限的底部
   */
  const handleCrossQuadrantMove = (
    taskId: string,
    draggedTask: Task,
    finalQuadrant: QuadrantType,
    targetQuadrantTasks: Task[]
  ) => {
    // 计算新的 order（放到目标象限末尾）
    const lastTask = targetQuadrantTasks[targetQuadrantTasks.length - 1]
    const newOrder = lastTask 
      ? getRankBetween(lastTask.order, null) 
      : draggedTask.order  // 如果目标象限为空，保持原 order

    // 保存原始值用于回滚
    const originalQuadrant = draggedTask.quadrant
    const originalOrder = draggedTask.order

    // 乐观更新
    queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
      return oldTasks.map((t) =>
        t.id === taskId ? { ...t, quadrant: finalQuadrant, order: newOrder } : t
      )
    })

    // API 请求
    updateTaskMutation.mutate(
      { id: taskId, data: { quadrant: finalQuadrant, order: newOrder } },
      {
        onError: () => {
          queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
            return oldTasks.map((t) =>
              t.id === taskId ? { ...t, quadrant: originalQuadrant, order: originalOrder } : t
            )
          })
        },
      }
    )
  }

  // ========== 按象限分组任务 ==========
  
  const tasksByQuadrant = useMemo(() => {
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    
    const result: Record<QuadrantType, Task[]> = {
      Q1: [],
      Q2: [],
      Q3: [],
      Q4: [],
    }
    
    for (const task of currentTasks) {
      result[task.quadrant].push(task)
    }
    
    return result
  }, [tasks, queryClient])

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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
        {QUADRANT_CONFIGS.map((config) => (
          <Quadrant
            key={config.id}
            quadrantId={config.id}
            tasks={tasksByQuadrant[config.id]}
            originQuadrant={originQuadrant}
            currentOverQuadrant={currentOverQuadrant}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
            onAddTask={handleAddTask}
          />
        ))}
      </div>

      {/* 拖拽预览层 */}
      <DragOverlay>
        {activeTask ? <DraggedTaskPreview task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
