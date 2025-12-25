"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = exports.signinSchema = void 0;
const zod_1 = require("zod");
/**
 * 登录请求参数 Schema
 */
exports.signinSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, '用户名不能为空'),
    password: zod_1.z.string().min(1, '密码不能为空'),
});
/**
 * 注册请求参数 Schema
 */
exports.signupSchema = zod_1.z.object({
    username: zod_1.z
        .string()
        .min(3, '用户名长度不能少于3个字符')
        .max(20, '用户名长度不能超过20个字符'),
    password: zod_1.z
        .string()
        .min(6, '密码长度不能少于6个字符')
        .max(20, '密码长度不能超过20个字符'),
});
