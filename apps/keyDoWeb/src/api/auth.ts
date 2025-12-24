/**
 * 认证相关 API
 */
import { apiClient } from '@/lib/axios'

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  access_token: string
  userId: number
}

/**
 * 注册请求参数
 */
export interface SignupRequest {
  username: string
  password: string
  nickname?: string
}

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient.post('/auth/signin', data)
}

/**
 * 用户注册
 */
export function signup(data: SignupRequest) {
  return apiClient.post('/auth/signup', data)
}

/**
 * 退出登录
 */
export function logout() {
  return apiClient.post('/auth/logout')
}


