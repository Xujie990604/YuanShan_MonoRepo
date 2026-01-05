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

/**
 * Zod 表单验证规则
 * 
 * z.object(): 定义对象结构
 * - title: 字符串类型，最小长度为 1
 * - min(1, '...'): 如果长度小于 1，显示错误信息
 * 
 * 作用：验证任务标题不能为空
 */
const addTaskSchema = z.object({
  title: z.string().min(1, '请输入任务标题'),
})

/**
 * 从 Zod Schema 推断 TypeScript 类型
 * 
 * z.infer<typeof addTaskSchema>:
 * - 自动从 Schema 生成对应的 TypeScript 类型
 * - 等价于：{ title: string }
 * 
 * 好处：Schema 和类型定义保持一致，避免重复定义
 */
type AddTaskFormData = z.infer<typeof addTaskSchema>

/**
 * AddTaskDialog 组件的 Props 类型定义
 * - open: 控制对话框显示/隐藏
 * - onOpenChange: 对话框状态变化回调
 * - onConfirm: 确认添加任务的回调（接收任务标题）
 */
interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (title: string) => void
}

/**
 * 添加任务对话框组件
 * 
 * 功能：
 * 1. 显示添加任务的表单
 * 2. 表单验证（使用 react-hook-form + zod）
 * 3. 支持 Enter 键提交
 * 
 * 使用方式：
 * <AddTaskDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={(title) => handleAddTask(title)}
 * />
 */
export default function AddTaskDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddTaskDialogProps) {
  /**
   * useForm Hook：管理表单状态和验证
   * 
   * 参数说明：
   * - resolver: 使用 zodResolver 将 Zod Schema 与 react-hook-form 集成
   * - defaultValues: 表单字段的默认值
   * 
   * 返回值（form）包含：
   * - control: 表单控制器（用于 FormField）
   * - handleSubmit: 表单提交处理函数
   * - reset: 重置表单
   * - formState: 表单状态（错误、验证等）
   */
  const form = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema), // 使用 Zod 进行表单验证
    defaultValues: {
      title: '', // 任务标题默认为空
    },
  })

  /**
   * 表单提交处理
   * 
   * form.handleSubmit:
   * - 自动进行表单验证
   * - 如果验证通过，执行回调函数
   * - 如果验证失败，不执行回调，并显示错误信息
   * 
   * data: 验证通过后的表单数据（类型为 AddTaskFormData）
   */
  const handleSubmit = form.handleSubmit((data) => {
    // 调用父组件传递的确认回调
    onConfirm(data.title.trim()) // trim() 去除首尾空格
    form.reset() // 重置表单（清空输入框）
    onOpenChange(false) // 关闭对话框
  })

  /**
   * 对话框打开/关闭状态变化处理
   * 
   * @param open 对话框是否打开
   */
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    // 如果关闭对话框，重置表单（清空输入和错误信息）
    if (!open) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加任务</DialogTitle>
        </DialogHeader>

        {/**
         * Form 组件：react-hook-form 的表单容器
         * 
         * {...form}:
         * - 展开 form 对象，传递表单上下文给子组件
         * - FormField 等子组件需要这个上下文来访问表单状态
         */}
        <Form {...form}>
          {/**
           * form 标签：HTML 表单元素
           * 
           * onSubmit={handleSubmit}:
           * - 表单提交时触发
           * - handleSubmit 内部会先进行验证，验证通过才执行
           */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/**
               * FormField：表单字段组件（react-hook-form）
               * 
               * control={form.control}:
               * - 表单控制器，用于管理字段状态
               * 
               * name="title":
               * - 字段名称，对应 Schema 中的字段名
               * 
               * render={({ field }) => ...}:
               * - 渲染函数，field 包含 value、onChange、onBlur 等
               * - {...field} 展开到 Input 上，实现双向绑定
               */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>任务标题</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入任务标题"
                        autoFocus // 自动聚焦到输入框
                        {...field} // 展开 field，绑定 value、onChange 等
                        onKeyDown={(e) => {
                          // 按 Enter 键时提交表单
                          if (e.key === 'Enter') {
                            e.preventDefault() // 阻止默认行为（换行）
                            handleSubmit() // 触发表单提交
                          }
                        }}
                      />
                    </FormControl>
                    {/**
                     * FormMessage：显示字段验证错误信息
                     * - 如果 title 字段验证失败（如为空），会显示错误信息
                     * - 错误信息来自 Zod Schema 中定义的错误提示
                     */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              {/**
               * type="button":
               * - 防止点击取消按钮时触发表单提交
               * - 如果不设置，按钮默认 type="submit" 会提交表单
               */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                取消
              </Button>
              {/**
               * type="submit":
               * - 提交按钮，点击时触发表单的 onSubmit 事件
               * - 会先进行表单验证，验证通过才执行 handleSubmit
               */}
              <Button type="submit">添加</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
