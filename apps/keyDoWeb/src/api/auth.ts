/**
 * 认证相关 API
 */
import { apiClient } from '@/lib/axios'
import type { SigninInput, SigninResponse, SignupInput, SignupResponse, UserInfo } from '@yuan-shan/keydo-contract'

/**
 * 用户登录
 */
export function login(data: SigninInput): Promise<SigninResponse> {
  return apiClient.post('/auth/signin', data)
}

/**
 * 用户注册
 */
export function signup(data: SignupInput): Promise<SignupResponse> {
  return apiClient.post('/auth/signup', data)
}

/**
 * 退出登录
 */
export function logout() {
  return apiClient.post('/auth/logout')
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<UserInfo> {
  return apiClient.get('/user/profile')
}


