/**
 * 注册页面（使用 shadcn/ui Form）
 * 演示：UI 字段和接口字段不一致时，如何用 react-hook-form + zod 优雅处理
 */
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@yuan-shan/keydo-contract'
import { z } from 'zod'
import { useSignup } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
 * 🎯 UI 表单的 schema（扩展了 contract 的 schema）
 * 
 * 场景：注册表单有"确认密码"字段，但后端接口不需要这个字段
 * 
 * 方案：基于 contract 的 signupSchema，使用 .extend() 扩展 UI 专属字段
 */
const signupFormSchema = signupSchema
  .extend({
    // UI 专属字段：确认密码
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'], // 错误信息显示在 confirmPassword 字段
  })

/**
 * UI 表单数据类型
 */
type SignupFormData = z.infer<typeof signupFormSchema>

export default function SignupPage() {
  const signup = useSignup()
  
  // 🎯 使用 react-hook-form + zod（扩展后的 schema）
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema), // 使用扩展后的 schema
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  })
  
  // 提交处理
  const onSubmit = form.handleSubmit((data) => {
    // 🎯 关键：从 UI 表单数据转换为接口数据
    // 过滤掉 UI 独有的 confirmPassword 字段
    const apiData: SignupInput = {
      username: data.username,
      password: data.password,
      // 注意：不传 confirmPassword
    }
    
    signup.mutate(apiData)
  })
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          {/* 标题 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">创建账户</h1>
            <p className="text-muted-foreground">注册新用户</p>
          </div>
          
          {/* 注册表单 */}
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              {/* 用户名 */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="3-20个字符"
                        disabled={signup.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 密码 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="6-20个字符"
                        disabled={signup.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 确认密码（UI 独有字段） */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="再次输入密码"
                        disabled={signup.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full"
                disabled={signup.isPending}
              >
                {signup.isPending ? '注册中...' : '注册'}
              </Button>
            </form>
          </Form>
          
          {/* 登录链接 */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">已有账户？</span>
            <Link
              to="/auth/login"
              className="text-primary hover:underline ml-1"
            >
              立即登录
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

