/**
 * 登录页面
 */
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signinSchema, type SigninInput } from '@yuan-shan/keydo-contract'
import { useLogin } from '@/hooks/use-auth'
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

export default function LoginPage() {
  const login = useLogin()
  
  // 使用 react-hook-form + zod
  const form = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-muted/30">
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
                KeyDo
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                要事优先任务管理系统
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
                          disabled={login.isPending}
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
                          placeholder="请输入密码"
                          disabled={login.isPending}
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
                disabled={login.isPending}
              >
                {login.isPending ? '登录中...' : '进入系统'}
              </Button>

              {/* 注册链接 */}
              <div className="text-center pt-2">
                <Link
                  to="/auth/signup"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  还没有账号？
                  <span className="underline underline-offset-4 ml-1">立即注册</span>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}

