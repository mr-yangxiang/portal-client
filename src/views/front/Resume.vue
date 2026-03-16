<!-- 
  前台简历页
  @description 从后端 profile 接口获取个人配置，通过 Markdown 渲染简历内容，支持 PDF 导出
  @author yx
-->
<template>
  <div class="resume-container">
    <header class="glass-nav">
      <div class="nav-content">
        <router-link to="/" class="logo">NEXUS</router-link>
      </div>
    </header>

    <main class="resume-main">
      <div class="resume-paper">
        <!-- 头部信息区域（从 profile 接口获取） -->
        <div class="resume-header">
          <div class="name-block">
            <div class="avatar-wrapper" v-if="profile.avatar_url">
              <img :src="profile.avatar_url" alt="头像" class="avatar" />
            </div>
            <h1>{{ profile.nickname || '加载中...' }}</h1>
            <p>{{ profile.bio || '' }}</p>
          </div>
          <div class="contact-info">
            <p v-if="profile.github_url"><el-icon><Link /></el-icon> {{ profile.github_url }}</p>
          </div>
        </div>

        <el-divider class="cyber-divider" />

        <!-- 简历正文（Markdown 渲染） -->
        <div class="resume-section" v-if="profile.resume_content">
          <MarkdownViewer :content="profile.resume_content" />
        </div>
        <div class="resume-section" v-else>
          <p class="empty-tip">暂未配置简历内容，请在管理后台「个人设置」中编辑。</p>
        </div>

        <!-- 项目经验展示 -->
        <div class="resume-projects" v-if="projectList.length > 0">
          <el-divider class="cyber-divider" />
          <h2 class="section-title">项目经验 (Projects)</h2>
          <div class="project-grid">
            <GlassCard v-for="proj in projectList" :key="proj.id" shadow="hover" class="project-card" @click="$router.push(`/project/${proj.id}`)">
              <h3 class="proj-title">{{ proj.project_name }}</h3>
              <p class="proj-desc">{{ proj.description }}</p>
              <div class="proj-meta">
                <el-tag size="small" effect="dark" type="info" v-if="proj.category_name">{{ proj.category_name }}</el-tag>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Link } from '@element-plus/icons-vue'
import { getProfile, recordVisit } from '@/api/modules/sys'
import { getProjectList } from '@/api/modules/project'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()

const profile = ref({
  avatar_url: '',
  nickname: '',
  bio: '',
  github_url: '',
  resume_content: ''
})

// 获取个人配置
const fetchProfile = async () => {
  try {
    const res = await getProfile()
    if (res.data) {
      profile.value = res.data
    }
  } catch (e) {
    console.error('个人配置获取失败:', e)
  }
}

// 获取项目列表
const projectList = ref([])
const fetchProjects = async () => {
  try {
    const res = await getProjectList()
    projectList.value = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
  } catch (e) {
    console.error('项目获取失败:', e)
  }
}

onMounted(() => {
  fetchProfile()
  fetchProjects()
  recordVisit({ page_path: '/resume' }).catch(() => {})
})
</script>

<style lang="scss" scoped>
.resume-container {
  min-height: 100vh;
  background-color: var(--nexus-bg-color);
  background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, transparent 100%);
  padding-bottom: 80px;
}

.glass-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 17, 23, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  
  .nav-content {
    max-width: 1000px;
    margin: 0 auto;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
  }
  
  .logo { font-family: 'Fira Code', monospace; font-size: 18px; font-weight: 800; color: var(--el-text-color-primary); text-decoration: none; }
  .export-btn { font-family: 'Fira Code', monospace; font-weight: bold; }
}

.resume-main {
  max-width: 850px;
  margin: 40px auto;
  padding: 0 20px;
}

.resume-paper {
  background: rgba(30, 35, 42, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 60px 80px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  color: var(--el-text-color-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  .resume-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 30px;

    .name-block {
      flex: 1;
      
      .avatar-wrapper {
        margin-bottom: 16px;
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid var(--el-color-primary);
          object-fit: cover;
        }
      }
      
      h1 { margin: 0 0 16px 0; font-size: 32px; color: #fff; font-weight: 800; }
      p { margin: 0; color: var(--el-text-color-regular); font-size: 15px; }
    }

    .contact-info {
      text-align: right;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      color: var(--el-text-color-regular);
      p { margin: 0 0 6px 0; display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
    }
  }

  .cyber-divider { background-color: rgba(255, 255, 255, 0.1); margin: 30px 0; }

  .resume-section {
    .empty-tip {
      color: var(--el-text-color-regular);
      font-size: 14px;
      text-align: center;
      padding: 40px 0;
    }
  }

  .resume-projects {
    margin-top: 40px;
    
    .section-title {
      color: var(--el-color-primary);
      font-size: 22px;
      margin-bottom: 24px;
      font-family: 'Fira Code', monospace;
    }
    
    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      
      .project-card {
        cursor: pointer;
        transition: transform 0.3s;
        
        &:hover { transform: translateY(-5px); }
        
        :deep(.el-card__body) { padding: 20px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; }
        
        .proj-title { margin: 0 0 12px 0; color: #fff; font-size: 18px; line-height: 1.3; }
        .proj-desc { color: var(--el-text-color-regular); font-size: 14px; line-height: 1.6; flex: 1; margin: 0 0 16px 0; }
        .proj-meta { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
      }
    }
  }
}

/* 打印样式 */
@media print {
  .glass-nav { display: none; }
  .resume-container { background: #fff; }
  .resume-paper { 
    border: none; background: #fff; box-shadow: none; color: #000; padding: 0; 
    h1, .company, h3 { color: #000; }
  }
}
</style>
