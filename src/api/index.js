import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const http = axios.create({
  baseURL: '/api/v1', // 使用 vite.config.js 配置的 proxy 代理前缀
  timeout: 10000 // 10 秒超时
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    // 只有当访问后台管理相关页面（当前路由以 /admin 开头）时才携带 token
    const isAdminPage = router.currentRoute.value?.path?.startsWith('/admin')
    if (userStore.token && isAdminPage) {
      // 后端返回的 token 可能已包含 Bearer 前缀
      config.headers.Authorization = userStore.token.startsWith('Bearer') 
        ? userStore.token 
        : `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 如果返回的 code 为 200，说明业务成功
    const res = response.data
    if (res.code === 200) {
      return res
    } else {
      // 业务报错，例如 200101 或者 "身份认证失败！"
      if (res.message && res.message.includes('身份认证失败')) {
        const userStore = useUserStore()
        userStore.clearToken()
        
        // 只有在后台页面时才给出提示并跳转
        const isAdminPage = router.currentRoute.value?.path?.startsWith('/admin')
        if (isAdminPage) {
          ElMessage.warning('登录状态已过期，请重新登录')
          router.push('/admin/login')
        }
        return Promise.reject(new Error(res.message))
      }
      ElMessage.error(res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  error => {
    // http 状态码报错处理
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        // 未授权或 Token 过期
        const userStore = useUserStore()
        userStore.clearToken()
        
        // 只有在后台页面时才给出提示并跳转
        const isAdminPage = router.currentRoute.value?.path?.startsWith('/admin')
        if (isAdminPage) {
          ElMessage.warning('登录状态已过期，请重新登录')
          router.push('/admin/login')
        }
      } else {
        ElMessage.error(error.response.data.message || 'Server Error')
      }
    } else {
      ElMessage.error('网络连接异常或服务器宕机')
    }
    return Promise.reject(error)
  }
)

export const get = (url, params) => http.get(url, { params })
export const post = (url, data) => http.post(url, data)
export const put = (url, data) => http.put(url, data)
export const del = (url, params) => http.delete(url, { params })

export default http
