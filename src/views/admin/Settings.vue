<!-- 
  系统设置页面
  @description 管理后台个人资料修改、密码更新和门户偏好设置
  @author yx
-->
<template>
  <div class="settings-container">
    <h2 class="page-title">系统设置</h2>
    
    <el-tabs type="border-card" class="glass-tabs">
      <!-- 个人资料 / 安全设置 Tab -->
      <el-tab-pane label="个人档案 / 简历">
        <el-form label-width="120px" style="max-width: 900px; margin-top: 20px;">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="管理员名称">
                <el-input v-model="profileForm.nickname" placeholder="站点展示名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="头像 URL">
                <el-input v-model="profileForm.avatar_url" placeholder="https://..." />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="个人简介">
                <el-input v-model="profileForm.bio" placeholder="一句话签名的简短介绍" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="GitHub 主页">
                <el-input v-model="profileForm.github_url" placeholder="https://github.com/..." />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="核心技术栈">
            <el-input v-model="profileForm.tech_tags" placeholder="请输入将在首页大屏幕亮眼展示的核心技术栈（多个用英文逗号分隔）" />
          </el-form-item>
          
          <el-form-item label="简历正文内容">
            <!-- 独立全功能富文本 -->
            <div style="width: 100%; height: 500px; margin-bottom: 20px;">
              <RichEditor 
                v-model="profileForm.resume_content" 
                placeholder="请利用排版工具尽情挥洒您的履历故事..." 
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="saving" @click="saveProfile">保存个人档案</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <!-- 门户偏好设置 Tab -->
      <el-tab-pane label="门户偏好">
        <el-form label-width="160px" style="max-width: 600px; margin-top: 20px;">
          <el-form-item label="主题色">
            <el-color-picker v-model="form.themeColor" />
          </el-form-item>
          <el-form-item label="启用发光特效">
            <el-switch v-model="form.neonEffect" active-color="#00ffaa" />
          </el-form-item>
          <el-form-item label="接口请求超时(ms)">
            <el-slider v-model="form.timeout" :min="1000" :max="30000" :step="1000" show-input />
          </el-form-item>
          <el-form-item>
            <el-button type="success" plain @click="saveParams">保存偏好</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
/**
 * 系统设置页 - 逻辑层
 * 包含个人资料修改和门户偏好配置（后续可对接后端保存接口）
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProfile, saveProfile as updateProfile } from '@/api/modules/sys'
import RichEditor from '@/components/RichEditor.vue'

/** 设置表单数据 */
const form = reactive({
  name: '管理员',       // 管理员名称
  oldPass: '',          // 旧密码
  newPass: '',          // 新密码
  themeColor: '#00cc88', // 主题色
  neonEffect: true,     // 是否启用发光特效
  timeout: 10000        // 接口请求超时时间（毫秒）
})

/** 个人档案表单数据 */
const profileForm = reactive({
  nickname: '',
  avatar_url: '',
  bio: '',
  github_url: '',
  tech_tags: '',
  resume_content: ''
})

const saving = ref(false)

/** 获取服务端最新配置回显 */
const fetchProfile = async () => {
  try {
    const res = await getProfile()
    if (res.data) {
      Object.assign(profileForm, {
        nickname: res.data.nickname || '',
        avatar_url: res.data.avatar_url || '',
        bio: res.data.bio || '',
        github_url: res.data.github_url || '',
        tech_tags: res.data.tech_tags || '',
        resume_content: res.data.resume_content || ''
      })
    }
  } catch (e) {
    console.error('档案获取失败:', e)
  }
}

/** 提交个人档案保存 */
const saveProfile = async () => {
  saving.value = true
  try {
    await updateProfile(profileForm)
    ElMessage.success('个人档案信息已更新成功！')
  } catch (e) {
    console.error('档案更新失败:', e)
  } finally {
    saving.value = false
  }
}

/** 偏好设置假保存（尚未对接接口） */
const saveParams = () => {
  ElMessage.success('设置已存入本地')
}

onMounted(() => {
  fetchProfile()
})
</script>

<style lang="scss" scoped>
.page-title { 
  font-size: 20px; 
  font-family: 'Fira Code', monospace; 
  font-weight: 700; 
  color: var(--el-color-primary); 
  margin: 0 0 20px 0; 
}

.glass-tabs {
  background: rgba(30, 35, 42, 0.4) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  
  :deep(.el-tabs__header) {
    background-color: rgba(0, 0, 0, 0.2) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  }
  
  :deep(.el-tabs__item) {
    color: var(--el-text-color-regular) !important;
    border: none !important;
    
    &.is-active {
      color: var(--el-color-primary) !important;
      background-color: rgba(255, 255, 255, 0.05) !important;
      border-bottom: 2px solid var(--el-color-primary) !important;
    }
  }

  :deep(.el-form-item__label) {
    color: var(--el-text-color-primary);
  }
}
</style>
