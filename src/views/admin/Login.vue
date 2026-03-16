<!-- 
  管理后台登录页
  @description 管理员登录界面，通过用户名密码认证获取 JWT Token
  @author yx
-->
<template>
  <div class="login-container">
    <!-- 背景光效 -->
    <div class="stars-bg"></div>
    <GlassCard class="login-card">
      <!-- 登录表头 -->
      <div class="login-header">
        <h2 class="title">系统登录</h2>
        <p class="subtitle">请输入管理员账号和密码</p>
      </div>

      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>

        <el-form-item class="actions">
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleLogin" 
            class="glow-button"
            style="width: 100%;"
            size="large"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 底部系统状态指示 -->
      <div class="login-footer">
        <span class="status-indicator"></span> 系统状态：<span class="online-text">在线</span>
      </div>
    </GlassCard>
  </div>
</template>

<script setup>
/**
 * 管理员登录页 - 逻辑层
 * 负责表单验证、调用登录接口获取 Token、跳转到管理后台
 */
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { login } from '@/api/modules/sys'
import GlassCard from '@/components/GlassCard.vue'

/** 路由实例 */
const router = useRouter()
/** 用户状态管理（存储 Token） */
const userStore = useUserStore()

/** 登录表单引用（用于触发表单验证） */
const loginFormRef = ref(null)
/** 登录按钮加载状态 */
const loading = ref(false)

/** 登录表单数据 */
const loginForm = reactive({
  username: '',
  password: ''
})

/** 表单验证规则 */
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

/**
 * 处理登录操作
 * 先进行表单验证，通过后调用 POST /sys/login 接口获取 Token
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        // 将后端返回的 Token 存入 Pinia + localStorage
        userStore.setToken(res.data.token)
        ElMessage.success('登录成功！')
        router.push('/admin/dashboard')
      } catch (error) {
        console.error('登录失败:', error)
        // 错误提示已在 api/index.js 响应拦截器中统一处理
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: var(--nexus-bg-color);
  overflow: hidden;
  
  .stars-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(circle at 15% 50%, rgba(0, 255, 170, 0.08), transparent 25%),
                      radial-gradient(circle at 85% 30%, rgba(56, 139, 253, 0.08), transparent 25%);
    z-index: 0;
  }
}

.login-card {
  width: 420px;
  z-index: 1;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
  
  .login-header {
    text-align: center;
    margin-bottom: 30px;
    
    .title {
      font-family: 'Fira Code', monospace;
      font-size: 24px;
      font-weight: 700;
      color: var(--el-color-primary);
      margin: 0 0 10px 0;
      letter-spacing: 2px;
      text-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
    }
    
    .subtitle {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin: 0;
    }
  }

  /* 输入框暗黑定制 */
  :deep(.el-input__wrapper) {
    background-color: rgba(0, 0, 0, 0.2) !important;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
    
    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
    }
    
    .el-input__inner {
      color: var(--el-text-color-primary);
      font-family: 'Fira Code', monospace;
    }
  }

  .glow-button {
    font-family: 'Fira Code', monospace;
    font-weight: bold;
    letter-spacing: 1px;
    background: transparent;
    border: 1px solid var(--el-color-primary);
    color: var(--el-color-primary);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(0, 255, 170, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 170, 0.4) inset, 0 0 15px rgba(0, 255, 170, 0.4);
    }
  }

  .login-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 12px;
    font-family: 'Fira Code', monospace;
    color: var(--el-text-color-regular);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--el-color-primary);
      box-shadow: 0 0 8px var(--el-color-primary);
      animation: pulse 2s infinite ease-in-out;
    }
    
    .online-text {
      color: var(--el-color-primary);
    }
  }
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}
</style>
