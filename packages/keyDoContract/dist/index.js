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
  order: z.string().optional()
  // 可选，不提供则由服务端计算 lexorank
});
var updateTaskSchema = z.object({
  title: z.string().min(1, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A").max(64, "\u4EFB\u52A1\u6807\u9898\u4E0D\u80FD\u8D85\u8FC7 64 \u4E2A\u5B57\u7B26").optional(),
  description: z.string().max(1e3, "\u4EFB\u52A1\u8BE6\u60C5\u4E0D\u80FD\u8D85\u8FC7 1000 \u4E2A\u5B57\u7B26").optional(),
  // 任务详情（可选）
  quadrant: z.enum(["Q1", "Q2", "Q3", "Q4"], {
    errorMap: () => ({ message: "\u8C61\u9650\u7C7B\u578B\u5FC5\u987B\u662F Q1\u3001Q2\u3001Q3 \u6216 Q4" })
  }).optional(),
  completed: z.boolean().optional(),
  order: z.string().optional()
  // 用于象限内排序
});

export { createTaskSchema, signinSchema, signupSchema, updateTaskSchema };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map