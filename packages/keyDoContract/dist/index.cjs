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
  title: zod.z.string().min(1, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A"),
  quadrant: zod.z.enum(["Q1", "Q2", "Q3", "Q4"], {
    errorMap: () => ({ message: "\u8C61\u9650\u7C7B\u578B\u5FC5\u987B\u662F Q1\u3001Q2\u3001Q3 \u6216 Q4" })
  }),
  order: zod.z.string().optional()
  // 可选，不提供则由服务端计算 lexorank
});
var updateTaskSchema = zod.z.object({
  title: zod.z.string().min(1, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A").optional(),
  quadrant: zod.z.enum(["Q1", "Q2", "Q3", "Q4"], {
    errorMap: () => ({ message: "\u8C61\u9650\u7C7B\u578B\u5FC5\u987B\u662F Q1\u3001Q2\u3001Q3 \u6216 Q4" })
  }).optional(),
  completed: zod.z.boolean().optional(),
  order: zod.z.string().optional()
  // 用于象限内排序
});

exports.createTaskSchema = createTaskSchema;
exports.signinSchema = signinSchema;
exports.signupSchema = signupSchema;
exports.updateTaskSchema = updateTaskSchema;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map