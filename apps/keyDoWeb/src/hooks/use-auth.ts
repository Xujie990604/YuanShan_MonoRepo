/**
 * 认证相关 Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '@/api/auth'
import { queryKeys } from './query-keys'
import { toast } from '@/lib/simple-toast'
import { useAuthStore } from '@/store/auth'

/**
 * 登录
 */
export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setToken } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // 保存 token
      setToken(data.access_token)
      
      // 清空相关缓存
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() })
      
      // 跳转到首页
      navigate('/')
      
      toast.success('登录成功，欢迎回来！')
    },
    onError: (error: any) => {
      toast.error(error.message || '用户名或密码错误')
    },
  })
}

/**
 * 注册
 */
export function useSignup() {
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      toast.success('注册成功，请登录')
      navigate('/auth/login')
    },
    onError: (error: any) => {
      toast.error(error.message || '注册失败，请稍后重试')
    },
  })
}

/**
 * 退出登录
 */
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearAuth } = useAuthStore()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // 清除认证信息
      clearAuth()
      
      // 清空所有缓存
      queryClient.clear()
      
      // 跳转到登录页
      navigate('/auth/login')
      
      toast.info('已退出登录')
    },
  })
}

/**
 * 检查登录状态
 * 应用启动时调用，验证 token 有效性并获取用户信息
 */
export function useCheckAuth() {
  const { token, setUser, clearAuth } = useAuthStore()
  
  const query = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authApi.getCurrentUser,
    enabled: !!token, // 只有有 token 时才请求
    retry: false,
  })
  
  // 使用 useEffect 来处理成功和错误情况
  useEffect(() => {
    if (query.isSuccess && query.data) {
      setUser(query.data)
    }
  }, [query.isSuccess, query.data, setUser])
  
  useEffect(() => {
    if (query.isError) {
      // token 无效时清除
      clearAuth()
    }
  }, [query.isError, clearAuth])
  
  return query
}


