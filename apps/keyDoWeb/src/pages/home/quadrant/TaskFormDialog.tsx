import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Task, QuadrantType } from '@yuan-shan/keydo-contract'

/**
 * Zod 表单验证规则
 * 
 * - title: 任务标题（必填，最多 64 个字符）
 * - description: 任务详情（可选，最多 1000 个字符）
 */
const taskFormSchema = z.object({
  title: z.string()
    .min(1, '请输入任务标题')
    .max(64, '任务标题不能超过 64 个字符'),
  description: z.string()
    .max(1000, '任务详情不能超过 1000 个字符')
    .optional(),
})

/**
 * 从 Zod Schema 推断 TypeScript 类型
 */
type TaskFormData = z.infer<typeof taskFormSchema>

/**
 * TaskFormDialog 组件的 Props 类型定义
 */
interface TaskFormDialogProps {
  open: boolean
  mode: 'add' | 'edit' // 模式：添加或编辑
  task?: Task | null // 编辑时传入任务数据，添加时为 undefined
  quadrant?: QuadrantType // 添加时传入象限，编辑时从 task 中获取
  onOpenChange: (open: boolean) => void
  onConfirm: (data: { title: string; description?: string }) => void
}

/**
 * 任务表单对话框组件（添加/编辑共用）
 * 
 * 功能：
 * 1. 支持添加和编辑两种模式
 * 2. 表单验证（使用 react-hook-form + zod）
 * 3. 支持 Enter 键提交（在标题输入框）
 * 
 * 使用方式：
 * // 添加模式
 * <TaskFormDialog
 *   open={isOpen}
 *   mode="add"
 *   quadrant="Q1"
 *   onOpenChange={setIsOpen}
 *   onConfirm={(data) => handleAddTask(data)}
 * />
 * 
 * // 编辑模式
 * <TaskFormDialog
 *   open={isOpen}
 *   mode="edit"
 *   task={task}
 *   onOpenChange={setIsOpen}
 *   onConfirm={(data) => handleEditTask(data)}
 * />
 */
export default function TaskFormDialog({
  open,
  mode,
  task,
  onOpenChange,
  onConfirm,
}: TaskFormDialogProps) {
  /**
   * useForm Hook：管理表单状态和验证
   */
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  /**
   * 当对话框打开或任务数据变化时，更新表单默认值
   */
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && task) {
        // 编辑模式：填充任务数据
        form.reset({
          title: task.title,
          description: task.description || '',
        })
      } else {
        // 添加模式：重置为空
        form.reset({
          title: '',
          description: '',
        })
      }
    }
  }, [open, mode, task, form])

  /**
   * 表单提交处理
   */
  const handleSubmit = form.handleSubmit((data) => {
    // 调用父组件传递的确认回调
    const trimmedDescription = data.description?.trim()
    
    // 简化处理：空字符串就传空字符串，服务端会将空字符串转为 null 清空字段
    onConfirm({
      title: data.title.trim(),
      description: trimmedDescription === '' ? '' : (trimmedDescription || undefined), // 空字符串传递空字符串
    })
    form.reset() // 重置表单
    onOpenChange(false) // 关闭对话框
  })

  /**
   * 对话框打开/关闭状态变化处理
   */
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    // 如果关闭对话框，重置表单
    if (!open) {
      form.reset()
    }
  }

  /**
   * 监听表单字段值，用于显示字符计数
   */
  const titleValue = form.watch('title') || ''
  const descriptionValue = form.watch('description') || ''
  
  const titleLength = titleValue.length
  const descriptionLength = descriptionValue.length
  const titleMaxLength = 64
  const descriptionMaxLength = 1000
  
  // 判断是否接近限制（超过 80%）
  const titleNearLimit = titleLength > titleMaxLength * 0.8
  const descriptionNearLimit = descriptionLength > descriptionMaxLength * 0.8

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? '添加任务' : '编辑任务'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* 任务标题 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>任务标题</FormLabel>
                      {/* 字符计数显示 */}
                      <span
                        className={cn(
                          'text-xs text-muted-foreground',
                          titleNearLimit && 'text-amber-600 dark:text-amber-500',
                          titleLength >= titleMaxLength && 'text-destructive'
                        )}
                      >
                        {titleLength}/{titleMaxLength}
                      </span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="请输入任务标题"
                        maxLength={64} // 限制最大长度为 64 个字符
                        autoFocus // 自动聚焦到输入框
                        {...field}
                        onKeyDown={(e) => {
                          // 按 Enter 键时提交表单（在标题输入框）
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit()
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 任务详情 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>任务详情</FormLabel>
                      {/* 字符计数显示 */}
                      <span
                        className={cn(
                          'text-xs text-muted-foreground',
                          descriptionNearLimit && 'text-amber-600 dark:text-amber-500',
                          descriptionLength >= descriptionMaxLength && 'text-destructive'
                        )}
                      >
                        {descriptionLength}/{descriptionMaxLength}
                      </span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="请输入任务详情（可选）"
                        maxLength={1000} // 限制最大长度为 1000 个字符
                        rows={4}
                        {...field}
                        value={field.value || ''} // 确保 value 不为 undefined
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {mode === 'add' ? '添加' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
