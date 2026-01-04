import { z } from 'zod';
/**
 * 登录请求参数 Schema
 */
export declare const signinSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
/**
 * 登录请求参数类型
 */
export type SigninInput = z.infer<typeof signinSchema>;
/**
 * 注册请求参数 Schema
 */
export declare const signupSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
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
