# KeyDo Web

基于 React + Vite 的现代化 Web 应用，使用 shadcn/ui 组件库和完整的状态管理方案。

## 技术栈

- **React 19** - UI 框架
- **Vite** - 构建工具
- **TypeScript** - 类型系统
- **React Router** - 路由管理
- **shadcn/ui** - 组件库
- **Tailwind CSS** - 样式框架
- **TanStack Query** - 服务端状态管理
- **Zustand** - 客户端状态管理

## 项目结构

```
src/
├── components/      # React 组件
│   └── ui/         # shadcn/ui 组件目录
├── hooks/          # 自定义 Hooks (TanStack Query)
├── lib/            # 工具函数
│   └── utils.ts    # shadcn/ui 工具函数
├── pages/          # 页面组件
│   ├── home/       # 首页
│   └── about/      # 关于页
├── router/         # 路由配置
│   └── index.tsx   # 路由定义
├── services/       # API 服务层
│   └── api.ts      # API 请求封装
├── store/          # Zustand 状态管理
│   └── ui.ts       # UI 状态
├── App.tsx         # 根组件
├── main.tsx        # 应用入口
└── index.css       # 全局样式
```

## 使用 shadcn/ui 组件

shadcn/ui 采用按需添加的方式，你需要手动添加所需的组件。

### 添加组件

```bash
# 进入项目目录
cd apps/keyDoWeb

# 添加 button 组件
pnpm dlx shadcn@latest add button

# 添加 card 组件
pnpm dlx shadcn@latest add card

# 添加 dialog 组件
pnpm dlx shadcn@latest add dialog
```

组件会被添加到 `src/components/ui/` 目录下，你可以直接导入使用：

```tsx
import { Button } from '@/components/ui/button'

function MyComponent() {
  return <Button>点击我</Button>
}
```

### 查看可用组件

访问 [shadcn/ui 官网](https://ui.shadcn.com/docs/components) 查看所有可用组件。

## 状态管理

### TanStack Query - 服务端状态

用于管理服务端数据的获取、缓存和更新。

```tsx
// 在 hooks 目录定义查询 hook
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  })
}

// 在组件中使用
function UserList() {
  const { data, isLoading, error } = useUsers()
  
  if (isLoading) return <div>加载中...</div>
  if (error) return <div>错误</div>
  
  return <div>{/* 渲染数据 */}</div>
}
```

### Zustand - 客户端状态

用于管理全局 UI 状态，如主题、侧边栏状态等。

```tsx
// 在 store 目录定义 store
export const useUIStore = create((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}))

// 在组件中使用
function ThemeToggle() {
  const { theme, setTheme } = useUIStore()
  
  return (
    <button onClick={() => setTheme('dark')}>
      切换主题
    </button>
  )
}
```

## 路由

路由配置在 `src/router/index.tsx`，使用 React Router v7 的数据路由方式。

```tsx
// 添加新路由
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'users',
        element: <UsersPage />,
      },
    ],
  },
])
```

## API 配置

API 服务配置在 `src/services/api.ts`，可以配置基础 URL、拦截器等。

```tsx
// 配置环境变量
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api

// .env.production
VITE_API_BASE_URL=https://api.example.com
```

## 样式定制

### 修改主题颜色

编辑 `src/index.css` 中的 CSS 变量：

```css
:root {
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... 其他颜色变量 */
}
```

### 修改 Tailwind 配置

编辑 `tailwind.config.js`：

```js
export default {
  theme: {
    extend: {
      // 自定义配置
    },
  },
}
```

## 开发建议

1. **组件组织**：将可复用的组件放在 `components/` 目录，页面特定的组件放在对应的页面目录下
2. **API 封装**：在 `services/` 目录统一管理 API 请求
3. **类型定义**：为 API 响应和状态定义 TypeScript 类型
4. **错误处理**：使用 TanStack Query 的错误处理机制统一处理错误
5. **代码规范**：使用 ESLint 保持代码风格一致

## 常用命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 添加 shadcn/ui 组件
npx shadcn@latest add [component-name]
```

## 相关文档

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/)
- [Zustand](https://zustand-demo.pmnd.rs/)
