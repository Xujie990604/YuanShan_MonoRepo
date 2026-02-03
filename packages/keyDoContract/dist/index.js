import { z } from 'zod';

// src/auth.ts
var signinSchema = z.object({
  username: z.string().min(1, "\u7528\u6237\u540D\u4E0D\u80FD\u4E3A\u7A7A"),
  password: z.string().min(1, "\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A")
});
var signupSchema = z.object({
  username: z.string().min(3, "\u7528\u6237\u540D\u957F\u5EA6\u4E0D\u80FD\u5C11\u4E8E3\u4E2A\u5B57\u7B26").max(20, "\u7528\u6237\u540D\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC720\u4E2A\u5B57\u7B26"),
  password: z.string().min(6, "\u5BC6\u7801\u957F\u5EA6\u4E0D\u80FD\u5C11\u4E8E6\u4E2A\u5B57\u7B26").max(20, "\u5BC6\u7801\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC720\u4E2A\u5B57\u7B26")
});
var createTaskSchema = z.object({
  title: z.string().min(1, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A").max(64, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u8D85\u8FC7 64 \u4E2A\u5B57\u7B26"),
  description: z.string().max(1e3, "\u4EFB\u52A1\u8BE6\u60C5\u4E0D\u80FD\u8D85\u8FC7 1000 \u4E2A\u5B57\u7B26").optional(),
  // 任务详情（可选）
  quadrant: z.enum(["Q1", "Q2", "Q3", "Q4"], {
    errorMap: () => ({ message: "\u8C61\u9650\u7C7B\u578B\u5FC5\u987B\u662F Q1\u3001Q2\u3001Q3 \u6216 Q4" })
  }),
  order: z.string().optional(),
  // 可选，不提供则由服务端计算 lexorank
  roleId: z.string().uuid().optional(),
  // 关联的角色 ID（可选）
  // 日期字段验证
  dueDate: z.string().datetime({ offset: true }).optional(),
  isAllDay: z.boolean().optional(),
  recurrence: z.object({
    type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    interval: z.number().int().min(1).default(1),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional()
  }).optional()
});
var updateTaskSchema = z.object({
  title: z.string().min(1, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A").max(64, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u8D85\u8FC7 64 \u4E2A\u5B57\u7B26").optional(),
  description: z.string().max(1e3, "\u4EFB\u52A1\u8BE6\u60C5\u4E0D\u80FD\u8D85\u8FC7 1000 \u4E2A\u5B57\u7B26").optional(),
  // 任务详情（可选）
  quadrant: z.enum(["Q1", "Q2", "Q3", "Q4"], {
    errorMap: () => ({ message: "\u8C61\u9650\u7C7B\u578B\u5FC5\u987B\u662F Q1\u3001Q2\u3001Q3 \u6216 Q4" })
  }).optional(),
  completed: z.boolean().optional(),
  order: z.string().optional(),
  // 用于象限内排序
  roleId: z.string().uuid().nullable().optional(),
  // 关联的角色 ID（可选，支持设为 null）
  // 日期字段验证
  dueDate: z.string().datetime({ offset: true }).optional(),
  isAllDay: z.boolean().optional(),
  recurrence: z.object({
    type: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    interval: z.number().int().min(1).default(1),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional()
  }).nullable().optional()
  // 支持设为 null 清除重复
});
var ROLE_COLORS = [
  "blue",
  // 蓝色系 - 专业/理性
  "green",
  // 绿色系 - 成长/健康
  "orange",
  // 橙色系 - 活力/创造
  "purple",
  // 紫色系 - 智慧/精神
  "red",
  // 红色系 - 激情/力量
  "yellow",
  // 黄色系 - 快乐/阳光
  "pink",
  // 粉色系 - 温柔/关怀
  "gray"
  // 灰色系 - 沉稳/平衡
];
var createRoleSchema = z.object({
  name: z.string().min(1, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A").max(10, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 10 \u4E2A\u5B57\u7B26"),
  icon: z.string().min(1, "\u8BF7\u9009\u62E9\u89D2\u8272\u56FE\u6807").max(10, "\u56FE\u6807\u683C\u5F0F\u9519\u8BEF"),
  color: z.enum(ROLE_COLORS, {
    errorMap: () => ({ message: "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u4E3B\u9898\u8272" })
  }),
  manifesto: z.string().min(10, "\u89D2\u8272\u5BA3\u8A00\u81F3\u5C11\u9700\u8981 10 \u4E2A\u5B57\u7B26").max(200, "\u89D2\u8272\u5BA3\u8A00\u4E0D\u80FD\u8D85\u8FC7 200 \u4E2A\u5B57\u7B26")
});
var updateRoleSchema = z.object({
  name: z.string().min(1, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A").max(10, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 10 \u4E2A\u5B57\u7B26").optional(),
  icon: z.string().min(1, "\u8BF7\u9009\u62E9\u89D2\u8272\u56FE\u6807").max(10, "\u56FE\u6807\u683C\u5F0F\u9519\u8BEF").optional(),
  color: z.enum(ROLE_COLORS, {
    errorMap: () => ({ message: "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u4E3B\u9898\u8272" })
  }).optional(),
  manifesto: z.string().max(200, "\u89D2\u8272\u5BA3\u8A00\u4E0D\u80FD\u8D85\u8FC7 200 \u4E2A\u5B57\u7B26").optional().refine(
    (val) => !val || val.length >= 10,
    { message: "\u89D2\u8272\u5BA3\u8A00\u81F3\u5C11\u9700\u8981 10 \u4E2A\u5B57\u7B26" }
  )
});

export { ROLE_COLORS, createRoleSchema, createTaskSchema, signinSchema, signupSchema, updateRoleSchema, updateTaskSchema };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map