# 象限内任务排序功能需求文档

## 📋 功能概述

为四象限任务管理添加**象限内拖拽排序**功能，允许用户在同一象限内通过拖拽调整任务顺序。

---

## 🎯 功能需求

### 1. 象限内排序

| 需求项 | 说明 |
|--------|------|
| **排序方式** | 用户可以在同一象限内拖拽任务，调整顺序 |
| **排序范围** | 仅限**未完成任务**，已完成任务不参与排序 |
| **视觉反馈** | 拖拽时，其他任务有「让位」动画效果 |
| **排序值存储** | 使用 **LexoRank** 算法计算 `order` 字段 |

### 2. 跨象限拖拽

| 需求项 | 说明 |
|--------|------|
| **目标位置** | 任务移动到目标象限的**底部** |
| **视觉反馈** | 目标象限容器**高亮**，但内部任务**无让位动画** |
| **排序值计算** | 使用目标象限最后一个任务的 `order` 生成新值（追加到末尾） |

### 3. 新任务创建

| 需求项 | 说明 |
|--------|------|
| **初始位置** | 新创建的任务放在象限**底部** |
| **排序值计算** | 使用当前象限最后一个任务的 `order` 生成新值 |

### 4. 已完成任务

| 需求项 | 说明 |
|--------|------|
| **排序方式** | 按 **order** 值排序（保持完成前的顺序），不支持拖拽排序 |
| **拖拽行为** | 已完成任务**不可拖拽** |
| **取消完成** | 保持原来的 order 值，恢复到未完成列表的原位置 |

---

## 🔄 拖拽行为详细说明

### 场景 1：象限内排序

```
用户在 Q1 内拖拽任务 A

1. 拖拽开始：记录任务 A 的原始象限 (Q1)
2. 拖拽过程：Q1 内其他任务有让位动画
3. 拖拽结束：
   - 计算新的 order 值（基于前后任务的 order）
   - 乐观更新 UI
   - 调用 API 更新 order
```

### 场景 2：跨象限拖拽

```
用户把任务 A 从 Q1 拖到 Q2

1. 拖拽开始：记录任务 A 的原始象限 (Q1)
2. 拖拽过程：
   - 任务进入 Q2 时，Q2 容器高亮
   - Q2 内任务无让位动画（禁用 Sortable）
3. 拖拽结束：
   - 任务放在 Q2 底部
   - 计算新的 order 值（Q2 最后一个任务之后）
   - 乐观更新 UI
   - 调用 API 更新 quadrant + order
```

### 场景 3：拖出后又拖回原象限

```
用户把任务 A 从 Q1 拖到 Q2，然后又拖回 Q1（未松手）

1. 拖拽开始：记录任务 A 的原始象限 (Q1)
2. 任务进入 Q2：Q2 高亮，无让位动画
3. 任务回到 Q1：恢复 Q1 的让位动画，用户可选择插入位置
4. 拖拽结束：按象限内排序处理
```

---

## 📊 状态判断逻辑

```
拖拽过程中需要实时判断：

┌─────────────────────────────────────────────────────┐
│  当前悬停位置 === 原始象限？                          │
├─────────────────────────────────────────────────────┤
│  是 → 启用 SortableContext（显示让位动画）            │
│  否 → 禁用 SortableContext（只高亮象限容器）          │
└─────────────────────────────────────────────────────┘
```

**需要维护的状态**：
- `activeTask`: 当前拖拽的任务
- `originQuadrant`: 拖拽开始时的原始象限
- `currentOverQuadrant`: 当前悬停的象限

---

## 🔢 LexoRank 排序值计算

### 使用的工具函数

位置：`packages/tools/src/lexorank/index.ts`

```typescript
// 获取两个排序值之间的中间值
getRankBetween(prev: string | null, next: string | null): string

// 生成初始排序值（第一个任务）
getInitialRank(): string
```

### 计算场景

| 场景 | prev | next | 结果 |
|------|------|------|------|
| 象限第一个任务 | `null` | `null` | 中间值 |
| 插入到最前面 | `null` | 第一个任务的 order | 比第一个小的值 |
| 插入到最后面 | 最后一个任务的 order | `null` | 比最后一个大的值 |
| 插入到中间 | 前一个任务的 order | 后一个任务的 order | 两者之间的值 |

---

## 🖥️ 前端实现方案

### 组件结构调整

```
QuadrantContainer
├── DndContext
│   ├── Quadrant (Q1)
│   │   ├── useDroppable (作为跨象限放置目标)
│   │   └── SortableContext (象限内排序，可动态启用/禁用)
│   │       └── TaskCard (useSortable)
│   ├── Quadrant (Q2) ...
│   ├── Quadrant (Q3) ...
│   └── Quadrant (Q4) ...
└── DragOverlay
```

### 关键状态

```typescript
// 当前拖拽的任务
const [activeTask, setActiveTask] = useState<Task | null>(null)

// 拖拽开始时的原始象限
const [originQuadrant, setOriginQuadrant] = useState<QuadrantType | null>(null)

// 当前悬停的象限（用于判断是否跨象限）
const [currentOverQuadrant, setCurrentOverQuadrant] = useState<QuadrantType | null>(null)
```

### 事件处理

```typescript
// 拖拽开始
onDragStart: (event) => {
  setActiveTask(task)
  setOriginQuadrant(task.quadrant)
}

// 拖拽过程中（监听悬停位置变化）
onDragOver: (event) => {
  // 判断当前悬停的象限
  setCurrentOverQuadrant(overQuadrant)
}

// 拖拽结束
onDragEnd: (event) => {
  if (originQuadrant === finalQuadrant) {
    // 象限内排序：计算新 order
  } else {
    // 跨象限：quadrant 变更 + order 设为目标象限末尾
  }
}
```

### SortableContext 动态控制

```typescript
// 在 Quadrant 组件中
const isSortingEnabled = 
  activeTask?.quadrant === quadrantId && // 拖拽的是本象限的任务
  currentOverQuadrant === quadrantId      // 且当前悬停在本象限

// 条件渲染 SortableContext
{isSortingEnabled ? (
  <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
    {tasks.map(task => <TaskCard ... />)}
  </SortableContext>
) : (
  // 不启用排序，只渲染任务列表
  tasks.map(task => <TaskCard ... />)
)}
```

### 乐观更新

与现有的跨象限拖拽一致：
1. 保存原始 order 值
2. 立即更新本地缓存（计算新 order）
3. 调用 API
4. 失败时回滚

---

## ⚙️ 后端实现方案

### API 变更

现有 `PATCH /api/v1/tasks/:id` 接口已支持 `order` 字段更新，无需新增接口。

### 请求参数

```typescript
// UpdateTaskInput (已在 keyDoContract 中定义)
{
  title?: string
  quadrant?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  completed?: boolean
  order?: string  // LexoRank 值
}
```

### TaskService 修改

#### 1. 创建任务时计算初始 order

```typescript
// task.service.ts - create 方法
async create(userId: number, createTaskInput: CreateTaskInput): Promise<Task> {
  const { title, quadrant } = createTaskInput;

  // 获取目标象限最后一个未完成任务的 order
  const lastTask = await this.prisma.task.findFirst({
    where: { userId, quadrant, completed: false },
    orderBy: { order: 'desc' },
  });

  // 计算新任务的 order（追加到末尾）
  const newOrder = lastTask 
    ? getRankBetween(lastTask.order, null)  // 比最后一个大
    : getInitialRank();                      // 第一个任务

  const task = await this.prisma.task.create({
    data: {
      userId,
      title,
      quadrant,
      order: newOrder,
      completed: false,
    },
  });

  return this.mapToTask(task);
}
```

#### 2. 更新任务时处理 order

```typescript
// task.service.ts - update 方法
async update(id: string, userId: number, updateTaskInput: UpdateTaskInput): Promise<Task> {
  const { title, quadrant, completed, order } = updateTaskInput;

  // 构建更新数据
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (quadrant !== undefined) updateData.quadrant = quadrant;
  if (completed !== undefined) updateData.completed = completed;
  if (order !== undefined) updateData.order = order;  // 直接使用前端计算的 order

  const task = await this.prisma.task.update({
    where: { id },
    data: updateData,
  });

  return this.mapToTask(task);
}
```

#### 3. 查询时按 order 排序

```typescript
// task.service.ts - findAll 方法
async findAll(userId: number): Promise<Task[]> {
  const tasks = await this.prisma.task.findMany({
    where: { userId },
    orderBy: [
      { quadrant: 'asc' },
      { order: 'asc' },  // 按 order 排序（LexoRank 字符串比较）
    ],
  });

  return tasks.map(this.mapToTask);
}
```

---

## 📁 文件修改清单

### 前端 (apps/keyDoWeb)

| 文件 | 修改内容 |
|------|----------|
| `QuadrantContainer.tsx` | 添加 `originQuadrant`、`currentOverQuadrant` 状态；修改拖拽事件处理逻辑 |
| `Quadrant.tsx` | 添加 `SortableContext`；根据状态动态启用/禁用排序 |
| `TaskCard.tsx` | 已完成任务禁用拖拽 |
| `use-tasks.ts` | 创建任务时不再传递固定 order（由后端计算） |

### 后端 (server/keyDoServer)

| 文件 | 修改内容 |
|------|----------|
| `task.service.ts` | `create`: 计算初始 order；`update`: 支持 order 更新；`findAll`: 按 order 排序 |

### 共享 (packages)

| 文件 | 修改内容 |
|------|----------|
| `packages/tools/src/lexorank/index.ts` | 无需修改（已实现） |
| `packages/keyDoContract/src/task.ts` | 无需修改（order 字段已定义） |

---

## ⚠️ 注意事项

### 1. LexoRank 重平衡

**当前策略**：暂不实现重平衡机制。

**风险**：极端情况下（同一位置反复插入数千次），LexoRank 可能无法生成新值。

**后续优化**：
- 监控 order 值长度
- 当长度超过阈值时，触发该象限的重平衡（批量更新所有任务的 order）

### 2. 并发安全

延续现有的乐观更新策略：
- 只保存和回滚单个任务的 order 值
- 不会覆盖其他并发操作

### 3. 已完成任务

- 不参与拖拽排序
- 按 `order` 值排序显示（保持完成前的顺序）
- 取消完成时，保持原来的 `order` 值，恢复到未完成列表的原位置

---

## ✅ 验收标准

1. [ ] 象限内拖拽任务，其他任务有让位动画
2. [ ] 象限内拖拽后，任务顺序正确保存并持久化
3. [ ] 跨象限拖拽时，目标象限高亮，无让位动画
4. [ ] 跨象限拖拽后，任务出现在目标象限底部
5. [ ] 拖出后又拖回原象限，恢复让位动画
6. [ ] 新创建的任务出现在象限底部
7. [ ] 已完成任务不可拖拽
8. [ ] 刷新页面后，任务顺序保持不变
9. [ ] 乐观更新：拖拽后立即更新 UI，失败时正确回滚
