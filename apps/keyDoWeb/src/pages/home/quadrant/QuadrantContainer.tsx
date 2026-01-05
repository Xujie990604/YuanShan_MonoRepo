/**
 * React Hooks 导入说明：
 * - useState: 用于创建组件内部状态（数据）
 * - useEffect: 用于处理副作用（如数据加载、保存）
 */
import { useState, useEffect } from 'react'

/**
 * @dnd-kit 拖拽库导入说明：
 * - DndContext: 拖拽上下文组件，包裹所有可拖拽元素
 * - DragOverlay: 拖拽预览层，显示拖拽中的元素
 * - DragStartEvent, DragEndEvent: 拖拽事件的类型定义
 */
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import Quadrant from './Quadrant'
import type { Task, QuadrantType } from '@/types/task'
import { QUADRANT_CONFIGS } from '@/types/task'
import { loadTasksFromStorage, saveTasksToStorage, generateTaskId } from '@/lib/task-storage'

/**
 * 四象限任务管理容器组件
 * 
 * 功能：
 * 1. 管理所有任务的状态（tasks）
 * 2. 处理任务的增删改查
 * 3. 实现拖拽功能（使用 @dnd-kit）
 * 4. 数据持久化（localStorage）
 */
export default function QuadrantContainer() {
  // ========== React Hooks：状态管理 ==========
  
  /**
   * useState：创建组件内部状态
   * - tasks: 所有任务的数组
   * - setTasks: 更新 tasks 的函数
   * - <Task[]> 是 TypeScript 类型注解，表示 tasks 是 Task 类型的数组
   */
  const [tasks, setTasks] = useState<Task[]>([])
  
  /**
   * activeTask: 当前正在拖拽的任务
   * - 用于在 DragOverlay 中显示拖拽预览
   * - null 表示没有任务在拖拽
   */
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // ========== useEffect：副作用处理 ==========
  
  /**
   * useEffect：组件挂载时执行一次（依赖数组为空 []）
   * 作用：从 localStorage 加载任务数据
   * 
   * 执行时机：
   * - 组件首次渲染后执行
   * - 如果 localStorage 没有数据，创建初始示例数据
   */
  useEffect(() => {
    // 从 localStorage 读取任务数据
    const loadedTasks = loadTasksFromStorage()
    
    if (loadedTasks.length === 0) {
      // 如果没有数据，创建初始示例数据（用于演示）
      const initialTasks: Task[] = [
        {
          id: generateTaskId(),
          title: '完成项目报告',
          quadrant: 'Q1',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateTaskId(),
          title: '学习新技能',
          quadrant: 'Q2',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setTasks(initialTasks)
      saveTasksToStorage(initialTasks)
    } else {
      // 如果有数据，直接使用
      setTasks(loadedTasks)
    }
  }, []) // 空依赖数组 [] 表示只在组件挂载时执行一次

  /**
   * useEffect：监听 tasks 变化，自动保存到 localStorage
   * 
   * 依赖数组 [tasks] 表示：
   * - 当 tasks 发生变化时，这个 effect 会重新执行
   * - 实现自动保存功能
   */
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasksToStorage(tasks)
    }
  }, [tasks]) // 依赖 tasks，每次 tasks 变化都会执行

  // ========== 任务操作方法 ==========
  
  /**
   * 切换任务完成状态
   * 
   * 为什么使用函数形式的 setTasks？
   * - React 状态更新是异步的，使用函数形式可以保证获取到最新的状态值
   * - prevTasks 参数是当前最新的 tasks 状态
   * 
   * 为什么使用 map？
   * - React 要求状态不可变（immutable），不能直接修改原数组
   * - map 会返回一个新数组，满足不可变性要求
   * - {...task} 是展开运算符，创建新对象而不是修改原对象
   * 
   * @param id 要切换的任务 ID
   */
  const handleToggleComplete = (id: string) => {
    setTasks((prevTasks) =>
      // map 遍历所有任务，返回新数组
      prevTasks.map((task) =>
        // 如果找到目标任务，创建新对象并切换完成状态
        task.id === id
          ? { 
              ...task,  // 展开原任务的所有属性
              completed: !task.completed,  // 切换完成状态（取反）
              updatedAt: new Date().toISOString()  // 更新时间戳
            }
          : task  // 其他任务保持不变（返回原引用，性能优化）
      )
    )
  }

  /**
   * 删除任务
   * 
   * filter 方法：
   * - 返回一个新数组，只包含满足条件的元素
   * - task.id !== id 表示保留所有 ID 不等于目标 ID 的任务
   * - 相当于从数组中移除指定任务
   * 
   * @param id 要删除的任务 ID
   */
  const handleDelete = (id: string) => {
    setTasks((prevTasks) => 
      // filter 过滤掉 ID 匹配的任务，返回新数组
      prevTasks.filter((task) => task.id !== id)
    )
  }

  /**
   * 添加新任务
   * 
   * 展开运算符 [...prevTasks, newTask]：
   * - 展开 prevTasks 数组的所有元素
   * - 在末尾添加 newTask
   * - 返回新数组（不修改原数组）
   * 
   * @param quadrant 任务所属象限（Q1/Q2/Q3/Q4）
   * @param title 任务标题
   */
  const handleAddTask = (quadrant: QuadrantType, title: string) => {
    // 创建新任务对象
    const newTask: Task = {
      id: generateTaskId(),  // 生成唯一 ID
      title,
      quadrant,
      completed: false,  // 新任务默认为未完成
      createdAt: new Date().toISOString(),  // 创建时间
      updatedAt: new Date().toISOString(),  // 更新时间
    }
    // 将新任务添加到数组末尾
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  // ========== 拖拽功能处理（@dnd-kit 插件） ==========
  
  /**
   * 拖拽开始事件处理
   * 
   * @dnd-kit 插件说明：
   * - DragStartEvent: 拖拽开始时触发的事件对象
   * - event.active: 被拖拽的元素信息（包含 id）
   * 
   * 作用：
   * 1. 根据拖拽元素的 ID 找到对应的任务
   * 2. 保存到 activeTask，用于显示拖拽预览（DragOverlay）
   * 
   * @param event 拖拽开始事件对象
   */
  const handleDragStart = (event: DragStartEvent) => {
    // 从事件中获取被拖拽的元素信息
    const { active } = event
    // active.id 是任务的 ID，通过 find 找到对应的任务对象
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      // 保存当前拖拽的任务，用于在 DragOverlay 中显示预览
      setActiveTask(task)
    }
  }

  /**
   * 拖拽结束事件处理
   * 
   * @dnd-kit 插件说明：
   * - DragEndEvent: 拖拽结束时触发的事件对象
   * - event.active: 被拖拽的元素（任务）
   * - event.over: 拖拽目标（象限）
   * 
   * 执行流程：
   * 1. 清除拖拽预览（setActiveTask(null)）
   * 2. 检查是否有有效目标（over）
   * 3. 验证目标是否是有效象限（Q1/Q2/Q3/Q4）
   * 4. 更新任务的象限属性
   * 
   * @param event 拖拽结束事件对象
   */
  const handleDragEnd = (event: DragEndEvent) => {
    // 解构获取被拖拽元素和目标元素
    const { active, over } = event
    
    // 清除拖拽预览（隐藏 DragOverlay）
    setActiveTask(null)

    // 如果没有拖拽到有效目标（比如拖拽到空白区域），直接返回
    if (!over) return

    // 获取被拖拽任务的 ID 和目标象限 ID
    const taskId = active.id as string  // as string 是 TypeScript 类型断言
    const targetQuadrant = over.id as QuadrantType  // 目标象限（Q1/Q2/Q3/Q4）

    // 验证目标是否是有效的象限
    // some 方法：检查数组中是否有元素满足条件
    // 这里检查 QUADRANT_CONFIGS 中是否有配置的 ID 等于 targetQuadrant
    const isValidQuadrant = QUADRANT_CONFIGS.some((config) => config.id === targetQuadrant)
    if (!isValidQuadrant) return  // 如果不是有效象限（比如拖到任务卡片上），不执行更新

    // 更新任务的象限属性
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        // 找到被拖拽的任务，更新其象限
        task.id === taskId
          ? { 
              ...task, 
              quadrant: targetQuadrant,  // 更新象限
              updatedAt: new Date().toISOString()  // 更新时间戳
            }
          : task  // 其他任务保持不变
      )
    )
  }

  /**
   * 按象限筛选任务
   * 
   * filter 方法：
   * - 返回一个新数组，只包含满足条件的任务
   * - task.quadrant === quadrantId 表示只保留指定象限的任务
   * 
   * @param quadrantId 象限 ID（Q1/Q2/Q3/Q4）
   * @returns 该象限的所有任务数组
   */
  const getTasksByQuadrant = (quadrantId: QuadrantType) => {
    return tasks.filter((task) => task.quadrant === quadrantId)
  }

  // ========== 渲染组件 ==========
  
  return (
    /**
     * DndContext：@dnd-kit 的拖拽上下文组件
     * - 包裹所有可拖拽的元素
     * - onDragStart: 拖拽开始时触发
     * - onDragEnd: 拖拽结束时触发
     */
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* 
        四象限网格布局
        - grid-cols-2: 2 列
        - grid-rows-2: 2 行
        - gap-4: 象限之间的间距
      */}
      <div className="flex-1 h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
        {/**
         * map 方法：遍历 QUADRANT_CONFIGS 数组，为每个象限创建 Quadrant 组件
         * - key={config.id}: React 要求列表元素必须有唯一的 key
         * - 传递任务数据和处理函数给子组件
         */}
        {QUADRANT_CONFIGS.map((config) => (
          <Quadrant
            key={config.id}  // React 列表渲染必须的 key（用于性能优化）
            quadrantId={config.id}  // 象限 ID（Q1/Q2/Q3/Q4）
            tasks={getTasksByQuadrant(config.id)}  // 该象限的任务列表
            onToggleComplete={handleToggleComplete}  // 完成任务回调
            onDelete={handleDelete}  // 删除任务回调
            onAddTask={handleAddTask}  // 添加任务回调
          />
        ))}
      </div>
      
      {/**
       * DragOverlay：拖拽预览层
       * - 显示在拖拽过程中跟随鼠标的预览卡片
       * - activeTask 有值时显示，null 时隐藏
       */}
      <DragOverlay>
        {activeTask ? (
          <div className="flex items-center gap-2 p-3 rounded-md bg-card border border-border shadow-lg opacity-90">
            {/* 显示复选框状态（禁用，不可交互） */}
            <Checkbox checked={activeTask.completed} disabled />
            <span
              className={cn(
                'text-sm',
                // 如果任务已完成，显示删除线和灰色文字
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
