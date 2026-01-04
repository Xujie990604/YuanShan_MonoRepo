import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupInput } from '@yuan-shan/keydo-contract'
import { z } from 'zod'
import { useSignup } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { User, Lock } from 'lucide-react'
import Logo from '@/components/Logo'

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
  
  // 使用 react-hook-form + zod（扩展后的 schema）
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  })
  
  // 提交处理
  const onSubmit = form.handleSubmit((data) => {
    // 从 UI 表单数据转换为接口数据
    // 过滤掉 UI 独有的 confirmPassword 字段
    const apiData: SignupInput = {
      username: data.username,
      password: data.password,
    }
    
    signup.mutate(apiData)
  })
  
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 极简几何装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 border border-border/30 rounded-sm rotate-12" />
        <div className="absolute bottom-20 right-10 w-96 h-96 border border-border/20 rounded-sm -rotate-6" />
      </div>

      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex flex-col items-center gap-4">
            {/* 四象限 Logo */}
            <Logo />

            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                创建账号
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                开始使用要事优先任务管理系统
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-5">
              {/* 用户名字段 */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      用户名
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="请输入用户名"
                          disabled={signup.isPending}
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 密码字段 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      密码
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="6-20个字符"
                          disabled={signup.isPending}
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 确认密码字段 */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      确认密码
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="再次输入密码"
                          disabled={signup.isPending}
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full font-medium"
                size="lg"
                disabled={signup.isPending}
              >
                {signup.isPending ? '注册中...' : '创建账号'}
              </Button>

              {/* 登录链接 */}
              <div className="text-center pt-2">
                <Link
                  to="/auth/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  已有账号？
                  <span className="underline underline-offset-4 ml-1">立即登录</span>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}

