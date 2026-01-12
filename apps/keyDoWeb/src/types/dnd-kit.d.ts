/**
 * @dnd-kit 类型兼容性修复
 * 
 * 问题：@dnd-kit 的类型定义基于 React 18，与 @types/react@19 不兼容
 * 解决：扩展 JSX.IntrinsicAttributes 来解决类型冲突
 * 
 * 参考：https://github.com/clauderic/dnd-kit/issues/1194
 */

import '@dnd-kit/core'
import '@dnd-kit/sortable'

declare module '@dnd-kit/core' {
  // 重新导出组件，修复 JSX 类型兼容性
  export const DndContext: React.FC<React.ComponentProps<typeof import('@dnd-kit/core').DndContext>>
  export const DragOverlay: React.FC<React.ComponentProps<typeof import('@dnd-kit/core').DragOverlay>>
}

declare module '@dnd-kit/sortable' {
  export const SortableContext: React.FC<React.ComponentProps<typeof import('@dnd-kit/sortable').SortableContext>>
}
