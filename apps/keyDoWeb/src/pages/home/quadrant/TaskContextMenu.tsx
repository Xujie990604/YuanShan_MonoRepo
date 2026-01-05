import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Trash2 } from 'lucide-react'

/**
 * 任务右键菜单组件
 * 
 * 功能：
 * 1. 显示右键菜单（删除选项）
 * 2. 在鼠标位置显示菜单
 * 
 * 使用方式：
 * <TaskContextMenu taskId={task.id} onDelete={handleDelete}>
 *   <div onContextMenu={...}>任务卡片内容</div>
 * </TaskContextMenu>
 */
interface TaskContextMenuProps {
  taskId: string
  onDelete: (id: string) => void
  children: React.ReactElement
}

export default function TaskContextMenu({
  taskId,
  onDelete,
  children,
}: TaskContextMenuProps) {
  /**
   * contextMenuOpen: 控制右键菜单的显示/隐藏
   * - true: 显示菜单
   * - false: 隐藏菜单
   */
  const [contextMenuOpen, setContextMenuOpen] = useState(false)

  /**
   * contextMenuPosition: 右键菜单的显示位置
   * - x: 鼠标的 X 坐标
   * - y: 鼠标的 Y 坐标
   * - 用于在鼠标位置显示右键菜单
   */
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })

  /**
   * 右键菜单事件处理
   * 
   * e.preventDefault():
   * - 阻止浏览器默认的右键菜单
   * - 显示我们自定义的右键菜单
   * 
   * @param e 鼠标事件对象
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault() // 阻止浏览器默认右键菜单
    // 记录鼠标位置，用于定位右键菜单
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setContextMenuOpen(true) // 显示右键菜单
  }

  return (
    <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
      {/* 
        使用 React.cloneElement 将 onContextMenu 事件传递给子元素
        - 这样可以在子元素上触发右键菜单
        - children 是传入的子组件（通常是任务卡片）
      */}
      {React.cloneElement(children, {
        onContextMenu: handleContextMenu,
      })}

      {/* 
        右键菜单内容
        open: 控制菜单显示/隐藏
        onOpenChange: 菜单状态改变时同步 contextMenuOpen
        position fixed: 固定定位，配合 left/top 实现鼠标位置定位
        onCloseAutoFocus: 阻止自动聚焦，避免页面滚动
      */}
      <DropdownMenuContent
        align="end" // 菜单对齐方式（右对齐）
        style={{
          position: 'fixed', // 固定定位
          left: contextMenuPosition.x, // 鼠标 X 坐标
          top: contextMenuPosition.y, // 鼠标 Y 坐标
        }}
        onCloseAutoFocus={(e) => e.preventDefault()} // 阻止自动聚焦
      >
        <DropdownMenuItem
          className="text-destructive focus:text-destructive" // 危险操作样式（红色）
          onClick={() => {
            onDelete(taskId) // 调用删除回调
            setContextMenuOpen(false) // 关闭菜单
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> {/* 删除图标 */}
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
