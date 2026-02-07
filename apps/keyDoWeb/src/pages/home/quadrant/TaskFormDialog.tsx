import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useRoles } from '@/hooks/use-roles'
import { useRoleStore } from '@/store/role'
import { DateTimePicker } from '@/components/task/DateTimePicker'
import type { Task, QuadrantType, RecurrenceRule } from '@yuan-shan/keydo-contract'

/**
 * 特殊常量：表示"无角色"的值
 * 使用特殊字符串而不是空字符串，因为 SelectItem 不能使用空字符串作为 value
 */
const NO_ROLE_VALUE = '__none__'

/**
 * Zod 表单验证规则
 * 
 * - title: 任务标题（必填，最多 64 个字符）
 * - description: 任务详情（可选，最多 1000 个字符）
 * - roleId: 关联的角色 ID（可选）
 */
const taskFormSchema = z.object({
  title: z.string()
    .min(1, '请输入任务标题')
    .max(64, '任务标题不能超过 64 个字符'),
  description: z.string()
    .max(1000, '任务详情不能超过 1000 个字符')
    .optional(),
  roleId: z.string().optional(),
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
  onConfirm: (data: {
    title: string
    description?: string | null
    roleId?: string
    dueDate?: string | null
    dueTime?: string | null
    recurrence?: RecurrenceRule | null
  }) => void
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
  // 获取角色列表和聚焦状态
  const { data: roles = [] } = useRoles()
  const { focusedRoleId } = useRoleStore()

  // 日期状态管理
  const [dateValue, setDateValue] = useState<{
    dueDate?: string
    dueTime?: string
    recurrence?: RecurrenceRule
  }>({})

  /**
   * useForm Hook：管理表单状态和验证
   */
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      roleId: NO_ROLE_VALUE,
    },
  })

  /**
   * 当对话框打开或任务数据变化时，更新表单默认值
   * 智能默认值：如果正在聚焦某个角色，新建任务时自动选中该角色
   */
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && task) {
        // 编辑模式：填充任务数据
        form.reset({
          title: task.title,
          description: task.description || '',
          roleId: task.roleId || '',
        })
        setDateValue({
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          recurrence: task.recurrence,
        })
      } else {
        // 添加模式：智能默认值
        // 如果正在聚焦某个角色，自动选中该角色；否则为空
        form.reset({
          title: '',
          description: '',
          roleId: focusedRoleId || '',
        })
        setDateValue({})
      }
    }
  }, [open, mode, task, focusedRoleId, form])

  /**
   * 表单提交处理
   */
  const handleSubmit = form.handleSubmit((data) => {
    // 调用父组件传递的确认回调
    const trimmedDescription = data.description?.trim()
    const recurrenceValue =
      mode === 'edit' && dateValue.recurrence === undefined ? null : (dateValue.recurrence ?? undefined)
    onConfirm({
      title: data.title.trim(),
      description: trimmedDescription === '' ? (mode === 'edit' ? null : undefined) : (trimmedDescription || undefined),
      roleId: data.roleId || undefined,
      dueDate: dateValue.dueDate === undefined ? (mode === 'edit' ? null : undefined) : dateValue.dueDate,
      dueTime: dateValue.dueTime === undefined ? (mode === 'edit' ? null : undefined) : dateValue.dueTime,
      recurrence: recurrenceValue,
    })
    form.reset() // 重置表单
    setDateValue({}) // 重置日期
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
      setDateValue({})
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
          <DialogDescription>
            {mode === 'add' ? '创建一个新任务' : '修改任务信息'}
          </DialogDescription>
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

              {/* 日期设置 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  截止日期（可选）
                </label>
                <DateTimePicker value={dateValue} onChange={setDateValue} />
              </div>

              {/* 所属角色 */}
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所属角色（可选）</FormLabel>
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(value) => {
                        // 特殊值 __none__ 转换为空字符串
                        field.onChange(value === '__none__' ? '' : value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择角色（可留空）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">无角色（未分类）</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <span className="flex items-center gap-2">
                              <span>{role.icon}</span>
                              <span>{role.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
