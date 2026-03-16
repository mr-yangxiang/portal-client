/**
 * 应用入口文件
 * @description Vue3 应用初始化，注册 Element Plus UI 框架、Pinia 状态管理、路由和全局图标
 * @author yx
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

// 引入 Element Plus 组件库及样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入 Element Plus 暗色模式所需 CSS 变量
import 'element-plus/theme-chalk/dark/css-vars.css'
// 全局注册所有 Element Plus 图标组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入全局暗色主题样式
import './assets/dark-theme.scss'

/** 创建 Vue 应用实例 */
const app = createApp(App)
/** 创建 Pinia 状态管理实例 */
const pinia = createPinia()

// 批量注册 Element Plus 图标为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 安装插件
app.use(pinia)       // 状态管理
app.use(router)      // 路由
app.use(ElementPlus) // UI 框架

// 挂载到 DOM
app.mount('#app')

// 强制启用暗色模式
document.documentElement.classList.add('dark')
