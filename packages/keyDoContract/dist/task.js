"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
/**
 * 创建任务请求参数 Schema
 */
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, '任务标题不能为空'),
    quadrant: zod_1.z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
        errorMap: () => ({ message: '象限类型必须是 Q1、Q2、Q3 或 Q4' }),
    }),
    order: zod_1.z.string().optional(), // 可选，不提供则由服务端计算 lexorank
});
/**
 * 更新任务请求参数 Schema
 */
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, '任务标题不能为空').optional(),
    quadrant: zod_1.z.enum(['Q1', 'Q2', 'Q3', 'Q4'], {
        errorMap: () => ({ message: '象限类型必须是 Q1、Q2、Q3 或 Q4' }),
    }).optional(),
    completed: zod_1.z.boolean().optional(),
    order: zod_1.z.string().optional(), // 用于象限内排序
});
