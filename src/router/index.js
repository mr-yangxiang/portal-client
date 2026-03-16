/**
 * 前端路由配置
 * @description 基于 Vue Router 4 的路由定义，包含前台访客页面和管理后台页面两大模块
 *              管理后台页面需要登录鉴权（meta.requiresAuth）
 * @author yx
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

/** 路由表定义 */
const routes = [
  // ===== 前台访客页面（无需登录） =====
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/front/Home.vue')        // 首页
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('@/views/front/ArticleList.vue')  // 文章列表
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/front/ArticleDetail.vue') // 文章详情
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: () => import('@/views/front/ProjectDetail.vue') // 项目详情
  },
  {
    path: '/resume',
    name: 'Resume',
    component: () => import('@/views/front/Resume.vue')        // 简历页
  },

  // ===== 管理后台页面（需要登录鉴权） =====
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue')         // 管理员登录
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('@/views/admin/Layout.vue'),       // 后台布局框架
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },                              // 需要鉴权标志
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue')       // 仪表盘
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('@/views/admin/ArticleManage.vue')   // 文章管理
      },
      {
        path: 'article-edit',
        name: 'ArticleEdit',
        component: () => import('@/views/admin/ArticleEdit.vue')     // 文章编辑
      },
      {
        path: 'projects',
        name: 'AdminProjects',
        component: () => import('@/views/admin/ProjectManage.vue')   // 项目管理
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/CategoryManage.vue')  // 分类管理
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: () => import('@/views/admin/TagManage.vue')       // 标签管理
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/LogManage.vue')       // 操作日志
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/Settings.vue')        // 系统设置
      }
    ]
  },
  // 404 兜底：未匹配的路由重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

/** 创建路由实例（使用 HTML5 History 模式） */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * 全局路由前置守卫（防越权拦截）
 * - 需要鉴权的路由：检查 Token，无 Token 则重定向到登录页
 * - 已登录用户访问登录页：自动跳转到管理后台仪表盘
 */
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 判断该路由是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (userStore.token) {
      next()                     // 已登录，放行
    } else {
      next('/admin/login')       // 未登录，重定向到登录页
    }
  } else {
    // 针对已经登录状态下，禁止重复进入登录页
    if (to.path === '/admin/login' && userStore.token) {
      next('/admin/dashboard')
    } else {
      next()                     // 不需要鉴权，直接放行
    }
  }
})

export default router
