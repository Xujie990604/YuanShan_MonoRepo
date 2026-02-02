'use strict';

var zod = require('zod');

// src/auth.ts
var signinSchema = zod.z.object({
  username: zod.z.string().min(1, "\u7528\u6237\u540D\u4E0D\u80FD\u4E3A\u7A7A"),
  password: zod.z.string().min(1, "\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A")
});
var signupSchema = zod.z.object({
  username: zod.z.string().min(3, "\u7528\u6237\u540D\u957F\u5EA6\u4E0D\u80FD\u5C11\u4E8E3\u4E2A\u5B57\u7B26").max(20, "\u7528\u6237\u540D\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC720\u4E2A\u5B57\u7B26"),
  password: zod.z.string().min(6, "\u5BC6\u7801\u957F\u5EA6\u4E0D\u80FD\u5C11\u4E8E6\u4E2A\u5B57\u7B26").max(20, "\u5BC6\u7801\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC720\u4E2A\u5B57\u7B26")
});
var createTaskSchema = zod.z.object({
  title: zod.z.string().min(1, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A").max(64, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u8D85\u8FC7 64 \u4E2A\u5B57\u7B26"),
  description: zod.z.string().max(1e3, "\u4EFB\u52A1\u8BE6\u60C5\u4E0D\u80FD\u8D85\u8FC7 1000 \u4E2A\u5B57\u7B26").optional(),
  // 任务详情（可选）
  quadrant: zod.z.enum(["Q1", "Q2", "Q3", "Q4"], {
    errorMap: () => ({ message: "\u8C61\u9650\u7C7B\u578B\u5FC5\u987B\u662F Q1\u3001Q2\u3001Q3 \u6216 Q4" })
  }),
  order: zod.z.string().optional(),
  // 可选，不提供则由服务端计算 lexorank
  roleId: zod.z.string().uuid().optional()
  // 关联的角色 ID（可选）
});
var updateTaskSchema = zod.z.object({
  title: zod.z.string().min(1, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A").max(64, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u8D85\u8FC7 64 \u4E2A\u5B57\u7B26").optional(),
  description: zod.z.string().max(1e3, "\u4EFB\u52A1\u8BE6\u60C5\u4E0D\u80FD\u8D85\u8FC7 1000 \u4E2A\u5B57\u7B26").optional(),
  // 任务详情（可选）
  quadrant: zod.z.enum(["Q1", "Q2", "Q3", "Q4"], {
    errorMap: () => ({ message: "\u8C61\u9650\u7C7B\u578B\u5FC5\u987B\u662F Q1\u3001Q2\u3001Q3 \u6216 Q4" })
  }).optional(),
  completed: zod.z.boolean().optional(),
  order: zod.z.string().optional(),
  // 用于象限内排序
  roleId: zod.z.string().uuid().nullable().optional()
  // 关联的角色 ID（可选，支持设为 null）
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
var createRoleSchema = zod.z.object({
  name: zod.z.string().min(1, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A").max(50, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 50 \u4E2A\u5B57\u7B26"),
  icon: zod.z.string().min(1, "\u8BF7\u9009\u62E9\u89D2\u8272\u56FE\u6807").max(10, "\u56FE\u6807\u683C\u5F0F\u9519\u8BEF"),
  color: zod.z.enum(ROLE_COLORS, {
    errorMap: () => ({ message: "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u4E3B\u9898\u8272" })
  }),
  manifesto: zod.z.string().min(10, "\u89D2\u8272\u5BA3\u8A00\u81F3\u5C11\u9700\u8981 10 \u4E2A\u5B57\u7B26").max(200, "\u89D2\u8272\u5BA3\u8A00\u4E0D\u80FD\u8D85\u8FC7 200 \u4E2A\u5B57\u7B26")
});
var updateRoleSchema = zod.z.object({
  name: zod.z.string().min(1, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A").max(50, "\u89D2\u8272\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 50 \u4E2A\u5B57\u7B26").optional(),
  icon: zod.z.string().min(1, "\u8BF7\u9009\u62E9\u89D2\u8272\u56FE\u6807").max(10, "\u56FE\u6807\u683C\u5F0F\u9519\u8BEF").optional(),
  color: zod.z.enum(ROLE_COLORS, {
    errorMap: () => ({ message: "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u4E3B\u9898\u8272" })
  }).optional(),
  manifesto: zod.z.string().max(200, "\u89D2\u8272\u5BA3\u8A00\u4E0D\u80FD\u8D85\u8FC7 200 \u4E2A\u5B57\u7B26").optional().refine(
    (val) => !val || val.length >= 10,
    { message: "\u89D2\u8272\u5BA3\u8A00\u81F3\u5C11\u9700\u8981 10 \u4E2A\u5B57\u7B26" }
  )
});

exports.ROLE_COLORS = ROLE_COLORS;
exports.createRoleSchema = createRoleSchema;
exports.createTaskSchema = createTaskSchema;
exports.signinSchema = signinSchema;
exports.signupSchema = signupSchema;
exports.updateRoleSchema = updateRoleSchema;
exports.updateTaskSchema = updateTaskSchema;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map