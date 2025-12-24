/**
 * 认证相关 Hooks
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authApi from '@/api/auth'
import { queryKeys } from './query-keys'
import { toast } from '@/lib/simple-toast'

/**
 * 登录
 */
export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // 保存 token
      localStorage.setItem('access_token', data.access_token)
      
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
      navigate('/login')
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
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // 清除 token
      localStorage.removeItem('access_token')
      
      // 清空所有缓存
      queryClient.clear()
      
      // 跳转到登录页
      navigate('/login')
      
      toast.info('已退出登录')
    },
  })
}


