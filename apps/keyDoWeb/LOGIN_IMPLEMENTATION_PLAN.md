# 登录和注册功能实现方案

## 📋 现有实现

### 前端 (keyDoWeb)
- ✅ 登录页面 (`src/pages/auth/login.tsx`) - shadcn/ui + react-hook-form + zod
- ✅ 注册页面 (`src/pages/auth/signup.tsx`) - 包含确认密码字段
- ✅ 认证 Hooks (`src/hooks/use-auth.ts`) - useLogin, useSignup, useLogout
- ✅ API 调用 (`src/api/auth.ts`) - login, signup, logout, getCurrentUser
- ✅ 路由配置 (`src/router/index.tsx`) - `/auth/login`, `/auth/signup`
- ✅ Axios 拦截器 (`src/lib/axios.ts`) - 自动添加 token，统一响应处理
- ✅ Token 存储 - 使用 localStorage

### 后端 (keyDoServer)
- ✅ AuthController - `/auth/signin`, `/auth/signup` 接口
- ✅ AuthService - 登录、注册业务逻辑
- ✅ JWT 认证机制 - JwtModule, JwtStrategy
- ✅ 密码加密 - bcryptjs
- ✅ 全局 JWT Guard - 自动保护所有路由（除 @Public() 标记的）
- ✅ Zod 验证 - 使用 ZodValidationPipe 进行请求参数验证

### 类型定义 (keyDoContract)
- ✅ SigninInput / SigninResponse 类型和 Schema
- ✅ SignupInput / SignupResponse 类型和 Schema

---

## 🎯 目标

1. **V0 MCP 集成** - 使用 V0 生成的 UI 图指导项目实现
2. **后端接口** - 新增 `/auth/me` 接口获取当前用户信息
3. **前端路由守卫** - 未登录自动跳转登录页
4. **状态管理** - 使用 Zustand 管理 token 和用户状态
5. **错误处理** - 401 错误自动清除 token 并跳转登录页

**不实现：**
- ❌ 退出登录接口（前端已有 logout API，后端不需要）
- ❌ Token 刷新机制
- ❌ 验证码功能
- ❌ 记住我功能
- ❌ 特殊业务规则

---

## 🔧 需要怎么做

### 1. 后端：新增 `/auth/me` 接口

**文件：** `server/keyDoServer/src/auth/auth.controller.ts`

```typescript
@Get('me')
@Public() // 或移除，由 JWT Guard 保护
async getCurrentUser(@Request() req) {
  return this.authService.getCurrentUser(req.user);
}
```

**文件：** `server/keyDoServer/src/auth/auth.service.ts`

```typescript
async getCurrentUser(user: { userId: number; username: string }) {
  return this.userService.findById(user.userId);
}
```

**类型扩展：** `packages/keyDoContract/src/auth.ts`

```typescript
export type UserInfo = {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### 2. 前端：Zustand 状态管理

**文件：** `apps/keyDoWeb/src/store/auth.ts` (新建)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: UserInfo | null
  setToken: (token: string | null) => void
  setUser: (user: UserInfo | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // 只持久化 token
    }
  )
)
```

**修改：** `apps/keyDoWeb/src/hooks/use-auth.ts`

- 使用 `useAuthStore` 替代 `localStorage`
- 登录成功后调用 `setToken` 和 `setUser`

**修改：** `apps/keyDoWeb/src/lib/axios.ts`

- 请求拦截器从 `useAuthStore.getState().token` 获取 token
- 响应拦截器 401 错误时调用 `useAuthStore.getState().clearAuth()`

---

### 3. 前端：路由守卫

**文件：** `apps/keyDoWeb/src/components/ProtectedRoute.tsx` (新建)

```typescript
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token)
  
  if (!token) {
    return <Navigate to="/auth/login" replace />
  }
  
  return <>{children}</>
}
```

**修改：** `apps/keyDoWeb/src/router/index.tsx`

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  // 认证路由不需要保护
  {
    path: '/auth',
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
    ],
  },
])
```

---

### 4. 前端：自动登录检查

**文件：** `apps/keyDoWeb/src/hooks/use-auth.ts`

新增 `useCheckAuth` hook：

```typescript
export function useCheckAuth() {
  const { token, setUser, clearAuth } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authApi.getCurrentUser,
    enabled: !!token, // 只有有 token 时才请求
    retry: false,
    onSuccess: (data) => {
      setUser(data)
    },
    onError: () => {
      clearAuth() // token 无效时清除
    },
  })
}
```

**修改：** `apps/keyDoWeb/src/App.tsx`

```typescript
import { useCheckAuth } from '@/hooks/use-auth'

function App() {
  useCheckAuth() // 应用启动时检查登录状态
  
  return (
    <div className="h-screen bg-background overflow-y-auto">
      <Outlet />
    </div>
  )
}
```

---

### 5. 前端：401 错误处理

**修改：** `apps/keyDoWeb/src/lib/axios.ts`

```typescript
apiClient.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    if (code === 200) {
      return data
    }
    return Promise.reject({ code, message, data })
  },
  (error: AxiosError) => {
    // 401 未授权，清除 token 并跳转登录页
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 📝 实现清单

### 后端
- [ ] 在 `AuthController` 添加 `GET /auth/me` 接口
- [ ] 在 `AuthService` 添加 `getCurrentUser` 方法
- [ ] 在 `keyDoContract` 添加 `UserInfo` 类型

### 前端
- [ ] 创建 `src/store/auth.ts` - Zustand store
- [ ] 修改 `src/hooks/use-auth.ts` - 使用 Zustand
- [ ] 修改 `src/lib/axios.ts` - 使用 Zustand token，401 处理
- [ ] 创建 `src/components/ProtectedRoute.tsx` - 路由守卫
- [ ] 修改 `src/router/index.tsx` - 应用路由守卫
- [ ] 修改 `src/App.tsx` - 添加自动登录检查
- [ ] 添加 `useCheckAuth` hook - 检查登录状态

---

## 📦 依赖检查

### 前端需要安装
```bash
pnpm --filter @yuan-shan/keyDoWeb add zustand
```

### 后端
- 无需新增依赖

---

## 🔍 测试要点

1. **登录流程**
   - 输入用户名密码 → 登录成功 → token 存储 → 跳转首页
   - 登录失败 → 显示错误提示

2. **注册流程**
   - 输入信息 → 注册成功 → 跳转登录页（或自动登录）

3. **路由守卫**
   - 未登录访问首页 → 自动跳转登录页
   - 已登录访问登录页 → 可正常访问（或跳转首页）

4. **401 处理**
   - Token 过期 → 自动清除 → 跳转登录页

5. **自动登录检查**
   - 刷新页面 → 有有效 token → 自动获取用户信息
   - 刷新页面 → token 无效 → 清除并跳转登录页

---

**最后更新：** 2025-01-XX
