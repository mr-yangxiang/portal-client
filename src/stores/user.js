/**
 * 用户状态管理（Pinia Store）
 * @description 管理用户登录 Token 和侧边栏折叠状态，数据持久化到 localStorage
 * @author yx
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  /** 用户鉴权 Token（从 localStorage 恢复） */
  const token = ref(localStorage.getItem('nexus_token') || '')
  /** 侧边栏是否折叠（从 localStorage 恢复，默认展开） */
  const isCollapse = ref(localStorage.getItem('nexus_isCollapse') === 'true')

  /**
   * 设置 Token 并持久化到 localStorage
   * @param {string} newToken 新的 JWT Token
   */
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('nexus_token', newToken)
  }

  /** 清除 Token 并移除 localStorage 记录（退出登录时调用） */
  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('nexus_token')
  }

  /** 切换侧边栏折叠状态并持久化 */
  const toggleSidebar = () => {
    isCollapse.value = !isCollapse.value
    localStorage.setItem('nexus_isCollapse', String(isCollapse.value))
  }

  return { token, setToken, clearToken, isCollapse, toggleSidebar }
})
