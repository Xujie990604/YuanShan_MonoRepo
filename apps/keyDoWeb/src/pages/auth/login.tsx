/**
 * 登录页面（使用 shadcn/ui Form）
 * 演示：react-hook-form + zod + shadcn/ui 的完美结合
 */
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signinSchema, type SigninInput } from '@yuan-shan/keydo-contract'
import { useLogin } from '@/hooks/use-auth'
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

export default function LoginPage() {
  const login = useLogin()
  
  // 🎯 使用 react-hook-form + zod
  const form = useForm<SigninInput>({
    resolver: zodResolver(signinSchema), // zod schema 自动校验
    defaultValues: {
      username: '',
      password: '',
    },
  })
  
  // 提交处理（数据已经过 zod 校验）
  const onSubmit = form.handleSubmit((data) => {
    login.mutate(data)
  })
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          {/* 标题 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">欢迎回来</h1>
            <p className="text-muted-foreground">登录您的账户</p>
          </div>
          
          {/* 登录表单 */}
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
                        placeholder="请输入用户名"
                        disabled={login.isPending}
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
                        placeholder="请输入密码"
                        disabled={login.isPending}
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
                disabled={login.isPending}
              >
                {login.isPending ? '登录中...' : '登录'}
              </Button>
            </form>
          </Form>
          
          {/* 注册链接 */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">还没有账户？</span>
            <Link
              to="/auth/signup"
              className="text-primary hover:underline ml-1"
            >
              立即注册
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

