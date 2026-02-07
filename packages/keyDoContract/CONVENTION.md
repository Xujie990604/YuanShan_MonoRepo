# API 参数值语义约定（PATCH/更新类接口）

所有支持「部分更新」的接口（如更新任务、更新角色）必须严格区分以下三种情况，前后端一致遵守。

## 约定

| 传参 | 含义 | 服务端行为 |
|------|------|------------|
| **undefined** 或 **未传该 key** | 不修改 | 不更新该字段，保持原值 |
| **null** | 清空 | 将该字段设为 DB 的 null |
| **""** 或 **0** 等有效值 | 主动设置 | 原样写入，不得当作「清空」或忽略 |

## 规则说明

1. **不设置**：客户端不传该字段，或传 `undefined`（JSON 中通常不序列化该 key）。服务端仅当 `value !== undefined` 时才把该字段加入更新对象。
2. **清空**：客户端显式传 `null`。服务端将该字段更新为 `null`。
3. **空字符串与 0**：`""`、`0` 是合法业务值，必须按「设置为该值」处理，不得视为「清空」或「不更新」。

## 契约（Zod）约定

- 可被清空的字段：`.nullable().optional()`，允许 `undefined | null | 有效类型`。
- 不将 `""` 或 `0` 在 schema 里转成 null；若业务上不接受空字符串，用 `.refine()` 等单独校验，而不是用空字符串表示清空。

## 服务端实现约定

- 更新时：`...(value !== undefined && { field: value === null ? null : value })`，即仅 null 清空，其余（含 `""`、`0`）原样写入。
- 禁止：`value || null`、`value === '' ? null : value` 等把 `""`/0 当作清空的写法。

## 涉及接口（当前）

- **PATCH 任务**（`updateTaskSchema`）：`description`、`dueDate`、`dueTime`、`roleId`、`recurrence` 等可清空字段遵循上述约定。
- **PATCH 角色**（`updateRoleSchema`）：当前无可清空字段；若后续增加（如 manifesto 可清空），须使用 `.nullable().optional()` 且仅用 null 表示清空。
