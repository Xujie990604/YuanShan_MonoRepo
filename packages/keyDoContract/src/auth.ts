import { z } from 'zod';

/**
 * 登录请求参数 Schema
 */
export const signinSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

/**
 * 登录请求参数类型
 */
export type SigninInput = z.infer<typeof signinSchema>;

/**
 * 注册请求参数 Schema
 */
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, '用户名长度不能少于3个字符')
    .max(20, '用户名长度不能超过20个字符'),
  password: z
    .string()
    .min(6, '密码长度不能少于6个字符')
    .max(20, '密码长度不能超过20个字符'),
});

/**
 * 注册请求参数类型
 */
export type SignupInput = z.infer<typeof signupSchema>;

/**
 * 登录响应类型
 */
export type SigninResponse = {
  access_token: string;
  userId: number;
};

/**
 * 注册响应类型
 */
export type SignupResponse = {
  id: number;
  username: string;
};

/**
 * 用户信息类型
 */
export type UserInfo = {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};
