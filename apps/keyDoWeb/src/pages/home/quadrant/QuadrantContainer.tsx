import { useState } from 'react'
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
       * 跨象限拖拽处理
       * 
       * 关键：在调用 mutate 之前，先立即乐观更新数据
       * 因为 onMutate 是异步的，在它执行之前数据还是旧的
       * 这会导致 dnd-kit 基于旧数据计算位置，产生回弹
       * 
       * 注意：这里已经乐观更新了，useUpdateTask 的 onMutate 中不再需要乐观更新
       * 但需要保存更新前的快照，用于错误回滚
       */
      // 保存更新前的快照，用于错误回滚
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list())
      
      // 立即乐观更新，避免回弹
      queryClient.setQueryData<Task[]>(queryKeys.tasks.list(), (oldTasks = []) => {
        return oldTasks.map((task) =>
          task.id === taskId
            ? { ...task, quadrant: finalQuadrant }
            : task
        )
      })

      // 然后发送持久化请求
      // 注意：useUpdateTask 的 onMutate 中不再乐观更新，只负责保存快照和回滚
      updateTaskMutation.mutate(
        {
          id: taskId,
          data: { quadrant: finalQuadrant },
        },
        {
          // 传入更新前的快照，用于错误回滚
          onError: () => {
            // 如果 API 失败，回滚到更新前的状态
            if (previousTasks) {
              queryClient.setQueryData(queryKeys.tasks.list(), previousTasks)
            }
          },
        }
      )
    }
    // 同象限内不再支持排序，直接返回
  }

  /**
   * 按象限筛选任务
   * 
   * 注意：
   * - 必须使用 queryClient.getQueryData 获取最新的数据（包括乐观更新）
   * - 不能直接使用 tasks（来自 useTasks hook），因为它可能滞后于乐观更新
   * - 排序由后端处理（按创建时间），前端只负责筛选
   */
  const getTasksByQuadrant = (quadrantId: QuadrantType) => {
    // 优先使用 queryData 中的最新数据（包括乐观更新）
    const currentTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks.list()) || tasks
    return currentTasks.filter((task) => task.quadrant === quadrantId)
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
