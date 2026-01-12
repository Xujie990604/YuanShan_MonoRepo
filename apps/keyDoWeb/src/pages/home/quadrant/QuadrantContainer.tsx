import { useState, useMemo } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import Quadrant from './Quadrant'
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
 * 3. 实现拖拽功能（使用 @dnd-kit）- 仅支持跨象限拖拽
 * 4. 任务排序：按创建时间排序（createdAt）
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

  /**
   * QueryClient：用于乐观更新任务数据
   * 在拖拽过程中实时更新本地缓存，避免视觉回弹
   */
  const queryClient = useQueryClient()

  // ========== 拖拽状态 ==========
  
  /**
   * activeTask: 当前正在拖拽的任务（用于 DragOverlay 显示）
   */
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // ========== 任务操作方法（带乐观更新） ==========
  
  /**
   * 切换任务完成状态（带乐观更新）
   * 
   * 乐观更新流程：
   * 1. 保存当前任务的原始状态（只保存这一个任务，不是整个列表）
   * 2. 立即更新本地缓存（UI 瞬间响应）
   * 3. 发送 API 请求
   * 4. 如果失败，只回滚这一个任务的状态（不影响其他并发操作）
   */
  const handleToggleComplete = (id: string) => {
    // 获取当前缓存数据
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    const task = currentTasks.find((t) => t.id === id)
    if (!task) return

    // 1. 保存当前任务的原始完成状态（只保存需要回滚的字段）
    const originalCompleted = task.completed
    
    // 2. 立即乐观更新
    queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
      return oldTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    })

    // 3. 发送 API 请求
    updateTaskMutation.mutate(
      {
        id,
        data: { completed: !task.completed },
      },
      {
        // 4. 失败时只回滚这一个任务的状态
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
   * 
   * 乐观更新流程：
   * 1. 保存被删除任务的完整数据（用于失败时恢复）
   * 2. 立即从本地缓存中移除任务（UI 瞬间响应）
   * 3. 发送 API 请求
   * 4. 如果失败，只把这一个任务加回去（不影响其他并发操作）
   */
  const handleDelete = (id: string) => {
    // 获取当前缓存数据
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    
    // 1. 保存被删除任务的完整数据
    const deletedTask = currentTasks.find((t) => t.id === id)
    if (!deletedTask) return
    
    // 2. 立即乐观更新（从列表中移除）
    queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
      return oldTasks.filter((t) => t.id !== id)
    })

    // 3. 发送 API 请求
    deleteTaskMutation.mutate(id, {
      // 4. 失败时只把这一个任务加回去
      onError: () => {
        queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
          // 检查任务是否已经被加回（避免重复）
          if (oldTasks.some((t) => t.id === id)) return oldTasks
          return [...oldTasks, deletedTask]
        })
      },
    })
  }

  /**
   * 添加新任务
   */
  const handleAddTask = (quadrant: QuadrantType, title: string) => {
    createTaskMutation.mutate({
      title,
      quadrant,
      // order 字段不再使用，服务端会设置默认值 'a'
    })
  }

  // ========== 拖拽功能处理 ==========
  
  /**
   * 拖拽开始事件处理
   * 
   * 功能：
   * 记录当前正在拖拽的任务，用于 DragOverlay 显示
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
   * 1. 使用最新的缓存数据
   * 2. 通过 over.id 判定最终落点象限
   * 3. 只处理跨象限拖拽，不再支持同象限内排序
   * 4. 立即乐观更新数据，然后发送持久化请求
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // 清除拖拽状态
    setActiveTask(null)

    // 如果拖拽取消（没有 over），直接返回
    if (!over) return

    const taskId = active.id as string
    
    // 使用最新的缓存数据（可能已被 onDragOver 乐观更新）
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    const draggedTask = currentTasks.find((t) => t.id === taskId)
    
    if (!draggedTask) return

    // 确定最终落点象限
    // 如果 over.id 是象限容器 ID，直接使用
    // 如果是任务 ID，则查找该任务所属的象限
    const isContainer = QUADRANT_CONFIGS.some((c) => c.id === over.id)
    const finalQuadrant = isContainer 
      ? (over.id as QuadrantType) 
      : currentTasks.find((t) => t.id === over.id)?.quadrant

    if (!finalQuadrant) return

    // 只处理跨象限拖拽
    if (draggedTask.quadrant !== finalQuadrant) {
      /**
       * 跨象限拖拽处理（并发安全的乐观更新）
       * 
       * 关键：在调用 mutate 之前，先立即乐观更新数据
       * 因为 onMutate 是异步的，在它执行之前数据还是旧的
       * 这会导致 dnd-kit 基于旧数据计算位置，产生回弹
       * 
       * 并发安全：
       * - 只保存和回滚单个任务的象限
       * - 不会覆盖其他并发操作的结果
       */
      // 保存当前任务的原始象限（只保存需要回滚的字段）
      const originalQuadrant = draggedTask.quadrant
      
      // 立即乐观更新，避免回弹
      queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
        return oldTasks.map((task) =>
          task.id === taskId
            ? { ...task, quadrant: finalQuadrant }
            : task
        )
      })

      // 然后发送持久化请求
      updateTaskMutation.mutate(
        {
          id: taskId,
          data: { quadrant: finalQuadrant },
        },
        {
          // 失败时只回滚这一个任务的象限
          onError: () => {
            queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
              return oldTasks.map((task) =>
                task.id === taskId
                  ? { ...task, quadrant: originalQuadrant }
                  : task
              )
            })
          },
        }
      )
    }
  }

  /**
   * 按象限分组任务（使用 useMemo 缓存）
   * 
   * 优化说明：
   * - 使用 useMemo 缓存分组结果，避免每次渲染都执行过滤
   * - 只有当 tasks 变化时才重新计算
   * - 乐观更新会触发 tasks 变化，从而触发重新计算
   * 
   * 返回值：Record<QuadrantType, Task[]>
   * - Q1: 重要且紧急的任务数组
   * - Q2: 重要不紧急的任务数组
   * - Q3: 不重要但紧急的任务数组
   * - Q4: 不重要不紧急的任务数组
   */
  const tasksByQuadrant = useMemo(() => {
    // 优先使用 queryClient 中的最新数据（包括乐观更新）
    // 这确保拖拽时的即时响应
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    
    // 初始化分组结果
    const result: Record<QuadrantType, Task[]> = {
      Q1: [],
      Q2: [],
      Q3: [],
      Q4: [],
    }
    
    // 一次遍历完成分组（O(n) 复杂度）
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
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
        {QUADRANT_CONFIGS.map((config) => (
          <Quadrant
            key={config.id}
            quadrantId={config.id}
            tasks={tasksByQuadrant[config.id]}
            isHighlighted={false}
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
