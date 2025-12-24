# keyDoWeb UI 设计规范指南

> 基于 Tailwind CSS + shadcn/ui 的独立开发者 UI 规范

## 🎨 颜色使用规范

### 页面布局
```tsx
// 页面容器
<div className="min-h-screen bg-background text-foreground">
  {/* 页面内容 */}
</div>
```

### 按钮规范

```tsx
// 主要按钮（最重要的操作）
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
  保存
</button>

// 次要按钮（常规操作）
<button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
  取消
</button>

// 危险按钮（删除、警告操作）
<button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90">
  删除
</button>

// 柔和按钮（不重要的操作）
<button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80">
  跳过
</button>
```

### 卡片规范

```tsx
// 标准卡片
<div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
  <h3 className="text-lg font-semibold mb-2">卡片标题</h3>
  <p className="text-muted-foreground">卡片内容</p>
</div>

// 可点击卡片
<div className="bg-card text-card-foreground p-6 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer">
  内容
</div>
```

### 表单规范

```tsx
// 输入框
<input 
  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
  placeholder="请输入..."
/>

// 标签
<label className="text-sm font-medium text-foreground">
  用户名
</label>

// 错误提示
<p className="text-sm text-destructive mt-1">
  此字段必填
</p>

// 帮助文字
<p className="text-sm text-muted-foreground mt-1">
  请输入 6-20 个字符
</p>
```

### 文字规范

```tsx
// 大标题
<h1 className="text-4xl font-bold text-foreground">
  页面标题
</h1>

// 二级标题
<h2 className="text-2xl font-semibold text-foreground">
  区块标题
</h2>

// 三级标题
<h3 className="text-lg font-medium text-foreground">
  小标题
</h3>

// 正文
<p className="text-foreground">
  正文内容
</p>

// 次要文字（描述、说明）
<p className="text-muted-foreground text-sm">
  这是一段说明文字
</p>
```

## 📏 间距规范

### 页面布局间距

```tsx
// 页面容器
<div className="container mx-auto px-4 py-8">
  {/* 内容 */}
</div>

// 区块间距
<div className="space-y-8">
  <section>区块 1</section>
  <section>区块 2</section>
</div>

// 卡片网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>卡片 1</div>
  <div>卡片 2</div>
  <div>卡片 3</div>
</div>
```

### 组件内部间距

```tsx
// 按钮内边距
<button className="px-4 py-2">标准按钮</button>
<button className="px-3 py-1 text-sm">小按钮</button>
<button className="px-6 py-3 text-lg">大按钮</button>

// 卡片内边距
<div className="p-4">小卡片</div>
<div className="p-6">标准卡片</div>
<div className="p-8">大卡片</div>
```

### 元素间距

```tsx
// 垂直间距（使用 space-y）
<div className="space-y-4">
  <div>元素 1</div>
  <div>元素 2</div>
</div>

// 水平间距（使用 space-x 或 gap）
<div className="flex gap-4">
  <button>按钮 1</button>
  <button>按钮 2</button>
</div>
```

## 🎭 圆角规范

```tsx
// 小圆角（标签、小按钮）
<span className="px-2 py-1 bg-secondary rounded-sm text-sm">
  标签
</span>

// 中圆角（输入框、普通按钮）
<button className="px-4 py-2 bg-primary rounded-md">
  按钮
</button>

// 大圆角（卡片、模态框）
<div className="p-6 bg-card rounded-lg border">
  卡片内容
</div>

// 完全圆角（头像、图标按钮）
<div className="w-10 h-10 rounded-full bg-primary">
  <img src="avatar.jpg" className="rounded-full" />
</div>
```

## 🌓 阴影规范

```tsx
// 无阴影（默认）
<div className="bg-card">

// 轻微阴影（卡片）
<div className="bg-card shadow-sm">

// 标准阴影（悬停效果）
<div className="bg-card shadow-md hover:shadow-lg transition-shadow">

// 大阴影（模态框、弹出层）
<div className="bg-card shadow-xl">
```

## 📱 响应式规范

```tsx
// 移动端优先
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* 
    手机：1列
    平板：2列
    笔记本：3列
    大屏：4列
  */}
</div>

// 响应式文字
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  响应式标题
</h1>

// 响应式间距
<div className="p-4 md:p-6 lg:p-8">
  响应式内边距
</div>

// 响应式显示/隐藏
<div className="hidden md:block">
  平板及以上显示
</div>
```

## 🎯 常用布局模式

### 导航栏

```tsx
<nav className="border-b border-border bg-background">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    <div className="text-xl font-bold">Logo</div>
    <div className="flex items-center gap-6">
      <a className="text-foreground/60 hover:text-foreground transition-colors">
        首页
      </a>
      <a className="text-foreground/60 hover:text-foreground transition-colors">
        关于
      </a>
    </div>
  </div>
</nav>
```

### 页面容器

```tsx
<main className="min-h-screen bg-background">
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    {/* 页面内容 */}
  </div>
</main>
```

### 表单布局

```tsx
<form className="space-y-6 max-w-md mx-auto">
  <div className="space-y-2">
    <label className="text-sm font-medium">用户名</label>
    <input className="w-full px-3 py-2 border border-input rounded-md" />
  </div>
  
  <div className="space-y-2">
    <label className="text-sm font-medium">密码</label>
    <input type="password" className="w-full px-3 py-2 border border-input rounded-md" />
  </div>
  
  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg">
    登录
  </button>
</form>
```

### 列表布局

```tsx
<div className="space-y-4">
  {items.map(item => (
    <div 
      key={item.id}
      className="p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
    >
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
    </div>
  ))}
</div>
```

### 网格布局

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {cards.map(card => (
    <div 
      key={card.id}
      className="p-6 bg-card border border-border rounded-lg"
    >
      {/* 卡片内容 */}
    </div>
  ))}
</div>
```

## 🎨 状态样式

```tsx
// 悬停效果
<button className="bg-primary hover:bg-primary/90 transition-colors">
  悬停变化
</button>

// 激活状态
<button className={cn(
  "px-4 py-2 rounded-lg",
  isActive 
    ? "bg-primary text-primary-foreground" 
    : "bg-secondary text-secondary-foreground"
)}>
  切换状态
</button>

// 禁用状态
<button 
  disabled
  className="px-4 py-2 bg-muted text-muted-foreground rounded-lg opacity-50 cursor-not-allowed"
>
  已禁用
</button>

// 加载状态
<button className="px-4 py-2 bg-primary rounded-lg flex items-center gap-2">
  <span className="animate-spin">⏳</span>
  加载中...
</button>
```

## 💡 实用技巧

### 1. 使用 cn() 函数管理类名

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-class",
  condition && "conditional-class",
  otherCondition ? "true-class" : "false-class"
)}>
```

### 2. 颜色透明度

```tsx
// 使用 /透明度 语法
<div className="bg-primary/50">50% 透明度</div>
<div className="bg-primary/80">80% 透明度</div>
```

### 3. 过渡动画

```tsx
// 颜色过渡
<div className="bg-primary hover:bg-primary/90 transition-colors">

// 阴影过渡
<div className="shadow-sm hover:shadow-lg transition-shadow">

// 全属性过渡
<div className="hover:scale-105 transition-all">
```

### 4. 深色模式

已配置深色模式支持，只需在根元素添加 `dark` 类即可：

```tsx
// 在 App.tsx 中
document.documentElement.classList.add('dark')
```

所有颜色会自动切换到深色模式变体！

## 📝 快速参考

### 常用类名组合

```tsx
// 主按钮
"px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"

// 卡片
"p-6 bg-card text-card-foreground border border-border rounded-lg shadow-sm"

// 输入框
"w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"

// 链接
"text-primary hover:underline"

// 标签
"px-2 py-1 bg-secondary text-secondary-foreground rounded-sm text-sm"
```

---

**记住：** 保持一致性比追求完美更重要！选择一套规范并坚持使用。

