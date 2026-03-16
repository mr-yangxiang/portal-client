<!-- 
  管理后台布局组件
  @description 包含侧边栏菜单、顶部导航栏和主内容区的整体后台布局框架
  @author yx
-->
<template>
  <el-container class="admin-layout">
    <!-- 侧边栏菜单 -->
    <el-aside :width="userStore.isCollapse ? '64px' : '240px'" class="glass-sidebar">
      <!-- Logo 区域 -->
      <div class="logo-container">
        <span class="logo-icon">#</span>
        <span v-show="!userStore.isCollapse" class="logo-text">管理后台</span>
      </div>
      
      <!-- 导航菜单（router 模式自动跳转） -->
      <el-menu
        :default-active="route.path"
        class="admin-menu"
        :collapse="userStore.isCollapse"
        router
        :collapse-transition="false"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <!-- 内容管理子菜单 -->
        <el-sub-menu index="content">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/admin/articles">文章管理</el-menu-item>
          <el-menu-item index="/admin/categories">分类管理</el-menu-item>
          <el-menu-item index="/admin/tags">标签管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/projects">
          <el-icon><Box /></el-icon>
          <template #title>项目管理</template>
        </el-menu-item>
        
        <el-menu-item index="/admin/logs">
          <el-icon><Odometer /></el-icon>
          <template #title>操作日志</template>
        </el-menu-item>

        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="main-container">
      <!-- 顶部 Header -->
      <el-header class="glass-header">
        <div class="header-left">
          <!-- 侧边栏折叠/展开按钮 -->
          <el-icon class="collapse-btn" @click="userStore.toggleSidebar">
            <Fold v-if="!userStore.isCollapse" />
            <Expand v-else />
          </el-icon>
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/" class="custom-breadcrumb">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ routeNameMap[route.name] || route.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <!-- 返回前台站点按钮 -->
          <el-button type="primary" size="small" plain @click="goFront">返回前台</el-button>
          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="geek-dropdown">
                <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                <el-dropdown-item divided command="logout" class="danger">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区（路由视图） -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
/**
 * 管理后台布局 - 逻辑层
 * 包含侧边栏状态管理、路由导航、用户操作（登出/个人设置）
 */
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import { DataBoard, Document, Box, Odometer, Setting, Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

/** 用户状态管理（Token、侧边栏折叠） */
const userStore = useUserStore()
/** 当前路由信息 */
const route = useRoute()
/** 路由实例（用于编程式导航） */
const router = useRouter()

/** 路由名称到中文显示的映射表 */
const routeNameMap = {
  Dashboard: '仪表盘',
  AdminArticles: '文章管理',
  ArticleEdit: '编辑文章',
  AdminProjects: '项目管理',
  AdminCategories: '分类管理',
  AdminTags: '标签管理',
  AdminLogs: '操作日志',
  AdminSettings: '系统设置'
}

/** 在新标签页中打开前台首页 */
const goFront = () => {
  window.open('/', '_blank')
}

/**
 * 处理下拉菜单命令
 * @param {string} cmd 命令标识（'logout' | 'profile'）
 */
const handleCommand = (cmd) => {
  if (cmd === 'logout') {
    userStore.clearToken()
    ElMessage.success('已退出登录')
    router.push('/admin/login')
  } else if (cmd === 'profile') {
    router.push('/admin/settings')
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
  background-color: var(--nexus-bg-color);
  
  /* 侧边栏玻璃拟物化 */
  .glass-sidebar {
    background: rgba(20, 24, 30, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    flex-direction: column;

    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      
      .logo-icon {
        color: var(--el-color-primary);
        font-size: 24px;
        font-weight: 700;
        font-family: 'Fira Code', monospace;
      }
      
      .logo-text {
        color: #fff;
        font-weight: 800;
        font-size: 16px;
        letter-spacing: 1px;
        white-space: nowrap;
      }
    }

    .admin-menu {
      border-right: none;
      flex: 1;
      background: transparent;

      :deep(.el-menu-item), :deep(.el-sub-menu__title) {
        color: var(--el-text-color-regular);
        border-left: 3px solid transparent;
        transition: all 0.3s;
        
        &:hover {
          color: var(--el-text-color-primary);
          background-color: rgba(255,255,255,0.05);
        }
        
        &.is-active {
          color: var(--el-color-primary) !important;
          background-color: rgba(0, 255, 170, 0.05) !important;
          border-left: 3px solid var(--el-color-primary);
        }
      }
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .glass-header {
      height: 60px;
      background: rgba(30, 35, 42, 0.4);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .collapse-btn {
          font-size: 20px;
          cursor: pointer;
          color: var(--el-text-color-regular);
          transition: color 0.3s;
          &:hover { color: var(--el-color-primary); }
        }

        .custom-breadcrumb {
          :deep(.el-breadcrumb__inner) {
            color: var(--el-text-color-regular);
            font-weight: normal;
            &.is-link:hover { color: var(--el-color-primary); }
          }
          :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
            color: var(--el-text-color-primary);
            font-weight: 600;
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 20px;

        .user-dropdown {
          display: flex;
          align-items: center;
          cursor: pointer;
          
          .el-icon--right {
            margin-left: 8px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }

    .main-content {
      padding: 24px;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
}
</style>
