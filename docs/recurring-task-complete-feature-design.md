# 重复任务完成功能 - 详细设计报告

## 一、现状分析

### 1.1 服务端现状

| 模块 | 现状 | 说明 |
|------|------|------|
| **TaskController** | 已有 `POST /tasks/:id/complete` 接口 | 需扩展为接收 `{ completed: boolean }` 请求体 |
| **TaskService.complete** | 已实现基本逻辑 | 标记完成 + 重复任务自动生成下一实例 |
| **TaskService.create** | 未处理重复任务 dueDate | 当前直接存储前端 dueDate，应改为有 recurrence 时忽略并自行计算 |
| **complete 返回值** | 仅返回已完成任务 | 未返回新创建的重复任务，前端需 refetch |

### 1.2 前端现状

| 模块 | 现状 | 说明 |
|------|------|------|
| **API (task.ts)** | 无 `completeTask` 方法 | 需新增 |
| **use-tasks** | 无 `useCompleteTask` | 需新增 |
| **QuadrantContainer** | 使用 `updateTask` 切换完成状态 | `handleToggleComplete` 调用 `updateTask(id, { completed })`，未调用 complete 接口 |
| **TaskCard** | 重复任务只显示 recurrence | 未显示 dueDate |
| **TaskFormDialog** | 编辑时回显 dueDate + recurrence | 与 TaskCard 统一，重复任务均显示 recurrence + dueTime? + dueDate |
| **DateTimePicker** | 回显时包含 dueDate | 需支持「仅重复策略」模式 |

### 1.3 当前 complete 逻辑问题

```typescript
// task.service.ts 第 161-189 行
const completedTask = await this.prisma.task.update({
  where: { id },
  data: { completed: true },  // ❌ 未清除 recurrence
});

if (task.recurrence) {
  await this.prisma.task.create({
    data: {
      // ...
      order: getRankBetween(null, null),  // ⚠️ 语义模糊，见下文
    },
  });
}
```

**问题点：**
1. 已完成任务未清除 `recurrence`，违背需求「已完成任务清除重复字段」
2. 新任务 `order` 使用 `getRankBetween(null, null)` 虽能得到合法值，但插入位置语义不清晰（见 4.4 节）

---

## 二、需求拆解

### 2.1 需求 1：重复任务创建时忽略前端 dueDate，由后端根据规则和当前日期计算

**背景：** 前端的 dueDate 来源于用户选中的日期，用于智能推导 recurrence（如选中下下周二 → 推导出「每周二」）。该日期仅用于生成规则，**不代表下一次应执行的时间**（下一次应为下周二，而非用户选择的下下周二）。

**语义：** 新建重复任务时，**一律忽略**前端传过来的 `dueDate`，由后端根据 `recurrence` 和当前日期（东八区）计算正确的首次 dueDate。

**规则：**
- 有 `recurrence`：**不采用**前端 dueDate，使用 `calculateNextDueDate(new Date(), recurrence)` 计算
- 有 `recurrence` 时 `dueTime`：保留前端传入值（用户选择的「几点」仍然有效）
- 无 `recurrence`：按现有逻辑，使用前端传入的 dueDate（如有）

### 2.2 需求 2 & 3：TaskCard 与 TaskFormDialog 统一显示「recurrence + dueTime? + dueDate」

**统一规则：** TaskCard 和 TaskFormDialog 对重复任务的展示不做区分，全部显示：`recurrence` + `dueTime`（如有）+ `dueDate`。

**当前：**
- TaskCard 单次任务：`dueDate` + `dueTime`（如有）
- TaskCard 重复任务：仅 `formatRecurrence(rule)` + `dueTime`，不显示 dueDate
- TaskFormDialog 编辑回显：此前设计为重复任务仅回显 recurrence，不回显 dueDate

**目标：** 两者统一为 `recurrence + dueTime? + dueDate`。

**显示格式建议：** `每天 · 2月7日` 或 `每周一 09:00 · 2月10日`（重复策略 + 时间可选 + 当前实例日期）

**影响：**
- TaskCard：重复任务 Badge 增加 dueDate 显示
- TaskFormDialog / DateTimePicker：编辑重复任务时，回显完整 `{ recurrence, dueTime, dueDate }`，与单次任务一致

### 2.4 需求 4：任务完成后的数据处理与 Order 计算

**4.1 已完成任务**
- 清除 `recurrence` 字段（设为 `null`）
- 保留 `dueDate`（记录该次完成的截止日）

**4.2 新生成的重复任务**
- 继承 `recurrence`
- `dueDate` 由 `calculateNextDueDate` 重新计算
- `order` 需要明确插入位置（见 4.4）

**4.3 Order 计算——核心问题**

**排序规则（已有）：**
- 同一象限内，按 `order` 升序（LexoRank 字符串比较）
- 未完成任务与已完成任务分开显示：先 `!completed`，再 `completed`
- 未完成任务列表中，`order` 越小越靠前（顶部）

**期望行为：** 新生成的重复任务应插入到**该象限未完成任务列表的顶部**（最优先显示）。

**LexoRank 语义：**
- `getRankBetween(null, next)`：插入到 next 之前 → 得到比 next 小的 rank → 在列表顶部方向
- `getRankBetween(prev, null)`：插入到 prev 之后 → 得到比 prev 大的 rank → 在列表底部方向

**正确做法：**
1. 查询该象限下**第一个未完成任务**（`order` 最小）
2. 新任务 `order = getRankBetween(null, firstTask.order)` → 插入到其之前，即未完成列表顶部

**边界情况：**
- 该象限无其他未完成任务：`order = getInitialRank()` 或 `getRankBetween(null, null)` 均可

**伪代码：**
```typescript
const firstIncomplete = await this.prisma.task.findFirst({
  where: { userId, quadrant, completed: false },
  orderBy: { order: 'asc' },
});
const newOrder = firstIncomplete
  ? getRankBetween(null, firstIncomplete.order)
  : getInitialRank();
```

---

## 三、接口与契约

### 3.1 前端 API

**接口约定**：complete 接口要求必传 `{ completed: boolean }` 请求体，**无需考虑向后兼容**。

**文件：** `apps/keyDoWeb/src/api/task.ts`

```typescript
/**
 * 设置任务完成状态（支持重复任务自动生成下一实例）
 * @param id 任务 ID
 * @param completed 完成状态（true=完成，false=取消完成）
 */
export function completeTask(id: string, data: { completed: boolean }): Promise<Task> {
  return apiClient.post(`/tasks/${id}/complete`, data);
}
```

### 3.2 keyDoContract 变更

- `CreateTaskInput`：`dueDate` 保持 optional，无需变更
- 服务端 `create`：有 recurrence 时忽略前端 dueDate，统一由后端计算
- 新增 `completeTaskSchema`：`{ completed: z.boolean() }`，用于 complete 接口请求体验证

### 3.3 返回值

- 返回更新后的任务；前端 `invalidateQueries` 获取完整列表（含可能新创建的重复任务）

---

## 四、实现方案

### 4.1 后端：TaskService.create

**位置：** `server/keyDoServer/src/task/task.service.ts`

**逻辑：** 有 recurrence 时一律忽略前端 dueDate，由后端根据规则和当前日期计算。
```typescript
// 伪代码
let finalDueDate: string | null;
if (recurrence) {
  // 重复任务：忽略前端 dueDate，按规则 + 当前日期计算
  finalDueDate = this.calculateNextDueDate(new Date(), recurrence);
} else {
  finalDueDate = dueDate ?? null;
}
// 写入时使用 finalDueDate，dueTime 仍用前端传入值
```

### 4.2 后端：TaskService.complete（扩展支持 completed: boolean）

- **请求体**：`{ completed: boolean }`（必传，无需考虑向后兼容）
- **completed === true**：执行完成逻辑
  1. 更新当前任务：`completed: true, recurrence: null`（若有 recurrence）
  2. 若有 recurrence：创建下一实例（继承 recurrence，dueDate 重算，order 按 2.4 节计算）
  3. 返回更新后的任务
- **completed === false**：执行取消完成。**不创建新任务**，**不修改 dueDate**，仅更新 `completed: false`。  
  **注意**：曾经的重复任务（已完成时 recurrence 已被清除）取消完成时，仅恢复 `completed: false`，不恢复 recurrence，不创建下一实例。

### 4.3 前端：完成状态变更

**统一调用 complete 接口**，完成与取消完成均走 `completeTask(id, { completed })`：

```typescript
// 统一用 complete 切换完成状态
completeTaskMutation.mutate({ id, data: { completed: !task.completed } });
```

**数据刷新策略**：完成状态变更统一采用 `invalidateQueries`，**不做乐观更新**。`onSuccess` 时调用 `queryClient.invalidateQueries({ queryKey: queryKeys.tasks.list() })` 重新拉取任务列表。

### 4.4 前端：API 与 Hooks

- 新增 `completeTask(id, { completed: boolean })` API
- 新增 `useCompleteTask` Hook，`onSuccess` 时 `invalidateQueries`（不做乐观更新）

### 4.5 前端：TaskCard 显示「重复策略 + dueDate」

**当前重复任务 Badge：**
```tsx
{task.recurrence && (
  <Badge>
    <Repeat />
    {formatRecurrence(task.recurrence)}
    {task.dueTime && <> {task.dueTime}</>}
  </Badge>
)}
```

**修改为：**
- 增加 dueDate 显示：`formatTaskDate(task.dueDate, task.dueTime)` 或精简格式
- 建议格式：`每周一 · 2月10日` 或 `每天 09:00 · 2月7日`（根据是否有 dueTime 调整）

### 4.6 前端：TaskFormDialog 编辑回显

**规则：** 与 TaskCard 一致，重复任务也完整回显 `recurrence + dueTime + dueDate`，不做区分。

**当前：**
```typescript
setDateValue({
  dueDate: task.dueDate,
  dueTime: task.dueTime,
  recurrence: task.recurrence,
});
```

**结论：** 无需修改，已满足「全部显示 recurrence + dueTime? + dueDate」。

---

## 五、数据流小结

### 5.1 创建重复任务

```
用户选中下下周二 → 推导 recurrence = 每周二，提交 { recurrence, dueDate: "下下周二", quadrant }
  → 后端 create：忽略 dueDate，计算 dueDate = 下周二（根据规则 + 当前日期）
  → 返回新任务（含正确的 dueDate，dueTime 沿用前端）
```

### 5.2 完成 / 取消完成

```
用户勾选完成
  → 前端调用 POST /tasks/:id/complete { completed: true }
  → 后端：completed=true 时，若为重复任务则清除 recurrence、创建下一实例；否则仅标记完成
  → 返回更新后的任务
  → 前端 invalidateQueries，拉取新列表

用户取消勾选
  → 前端调用 POST /tasks/:id/complete { completed: false }
  → 后端：不创建新任务、不修改 dueDate，仅更新 completed=false
  → 返回更新后的任务
```

### 5.3 TaskCard 与 TaskFormDialog 展示（统一规则）

| 类型 | 展示内容 |
|------|----------|
| 单次任务 | dueDate + dueTime（如有） |
| 重复任务 | recurrence + dueTime? + dueDate（三者完整展示） |
| 已完成任务 | dueDate + dueTime（无 recurrence） |

TaskCard 和 TaskFormDialog 对重复任务的回显不做区分，全部显示 recurrence + dueTime? + dueDate。

---

## 六、Order 计算汇总

| 场景 | 计算方式 |
|------|----------|
| 新重复任务插入位置 | `getRankBetween(null, firstIncomplete.order)`，若无未完成任务则 `getInitialRank()` |
| 旧任务（已完成） | 不修改 order，保持原值 |
| 语义 | 新任务出现在该象限未完成列表顶部 |

---

## 七、实施清单

### 后端
- [ ] `TaskService.create`：有 recurrence 时忽略前端 dueDate，由后端计算
- [ ] `TaskService.complete`：扩展支持 `{ completed: boolean }` 请求体；completed=true 时清除 recurrence、创建下一实例，order 按 2.4 节计算
- [ ] `TaskController`：complete 接口接收请求体并验证

### 前端 API / Hooks
- [ ] 新增 `completeTask(id, { completed })` API
- [ ] 新增 `useCompleteTask` Hook

### 前端 UI
- [ ] `QuadrantContainer`：完成状态切换统一调用 `completeTask(id, { completed: !task.completed })`
- [ ] `TaskCard`：重复任务 Badge 显示 recurrence + dueTime? + dueDate（统一规则）

### 测试与校验
- [ ] 创建重复任务（前端传「推导用」dueDate）→ 检查后端忽略之并计算出正确的下一次 dueDate
- [ ] 完成重复任务 → 检查旧任务 recurrence 已清空、新任务在顶部
- [ ] TaskCard / 编辑弹窗 → 重复任务均显示 recurrence + dueTime? + dueDate

---

## 八、风险与注意事项

1. **时区**：`calculateNextDueDate` 使用 `new Date()` 时需明确为东八区，避免跨日偏差。
2. **数据刷新**：完成状态变更统一采用 `invalidateQueries`，不做乐观更新。
3. **Schema 兼容**：create 接口仍接受 dueDate，有 recurrence 时后端忽略；无需改动 keyDoContract。
