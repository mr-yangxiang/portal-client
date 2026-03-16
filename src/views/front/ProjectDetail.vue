<!-- 
  前台项目详情页
  @description 从后端 project 接口获取项目详情，展示项目信息、架构图集和 Markdown 描述
  @author yx
-->
<template>
  <div class="project-detail-container">
    <header class="glass-nav">
      <div class="nav-content">
        <router-link to="/" class="logo">NEXUS</router-link>
        <el-button link class="back-btn" @click="$router.push('/')"><el-icon><Back /></el-icon> 返回</el-button>
      </div>
    </header>

    <main class="project-main">
      <div class="project-hero">
        <h1 class="project-title">{{ project.project_name || '加载中...' }}</h1>
        <p class="project-desc">{{ project.description || '' }}</p>
        <div class="project-links">
          <el-button v-if="project.preview_url" type="primary" class="cyber-btn" @click="openUrl(project.preview_url)">
            <el-icon><Link /></el-icon> 在线预览
          </el-button>
        </div>
        <div class="project-tags" v-if="project.tags && project.tags.length > 0">
          <span class="tag" v-for="tag in project.tags" :key="tag.id">
            {{ tag.tag_name }}
          </span>
        </div>
      </div>

      <!-- 架构图集 -->
      <div class="gallery-wrapper" v-if="archImages.length > 0">
        <h2 class="gallery-title">架构图集</h2>
        <div class="horizontal-scroll">
          <GlassCard v-for="(img, index) in archImages" :key="index" class="gallery-card" shadow="hover">
            <div class="image-block">
              <img :src="img" :alt="'架构图 ' + (index + 1)" class="arch-image" />
            </div>
            <div class="image-caption">架构图 {{ index + 1 }}</div>
          </GlassCard>
        </div>
      </div>

      <!-- 项目详细描述 -->
      <div class="project-content" v-if="project.description">
        <GlassCard>
          <MarkdownViewer :content="project.description" />
        </GlassCard>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Back, Link } from '@element-plus/icons-vue'
import { getProjectDetail } from '@/api/modules/project'
import { recordVisit } from '@/api/modules/sys'
import GlassCard from '@/components/GlassCard.vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

const route = useRoute()

const project = ref({
  project_name: '',
  description: '',
  arch_images: null,
  github_url: '',
  preview_url: '',
  category_name: '',
  tags: []
})

// 解析 arch_images 字段（JSON 字符串或数组）
const archImages = computed(() => {
  const raw = project.value.arch_images
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // 如果是单个 URL 字符串
    return raw ? [raw] : []
  }
})

// 获取项目详情
const fetchProject = async () => {
  try {
    const id = route.params.id
    if (!id) return
    const res = await getProjectDetail(id)
    if (res.data) {
      project.value = res.data
    }
  } catch (e) {
    console.error('项目详情获取失败:', e)
  }
}

// 打开外部链接
const openUrl = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

onMounted(() => {
  fetchProject()
  recordVisit({ page_path: `/project/${route.params.id}` }).catch(() => {})
})
</script>

<style lang="scss" scoped>
.project-detail-container {
  min-height: 100vh;
  background-color: var(--nexus-bg-color);
  padding-bottom: 60px;
}

.glass-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 17, 23, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  
  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
  }
  
  .logo {
    font-family: 'Fira Code', monospace;
    font-size: 18px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    text-decoration: none;
  }
  
  .back-btn { color: var(--el-color-primary); font-family: 'Fira Code', monospace; }
}

.project-main {
  max-width: 1200px;
  margin: 0 auto;
}

.project-hero {
  padding: 60px 24px;
  text-align: center;
  
  .project-title {
    font-size: 3rem;
    color: #fff;
    margin-bottom: 24px;
    font-weight: 800;
  }
  
  .project-desc {
    font-size: 1.2rem;
    color: var(--el-text-color-regular);
    max-width: 700px;
    margin: 0 auto 36px auto;
    line-height: 1.6;
  }
  
  .project-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 24px;
    
    .cyber-btn {
      font-family: 'Fira Code', monospace;
      padding: 0 24px;
      height: 48px;
      font-weight: bold;
      
      &.plain { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #fff; }
    }
  }

  .project-tags {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;

    .tag {
      padding: 4px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      color: rgba(255,255,255,0.7);
    }
  }
}

.gallery-wrapper {
  margin-bottom: 60px;
  position: relative;
  
  .gallery-title {
    padding: 0 24px;
    font-family: 'Fira Code', monospace;
    color: var(--el-color-primary);
    font-size: 14px;
    margin-bottom: 24px;
    letter-spacing: 2px;
  }
  
  .horizontal-scroll {
    display: flex;
    overflow-x: auto;
    gap: 24px;
    padding: 0 24px 24px 24px;
    scroll-snap-type: x mandatory;
    
    &::-webkit-scrollbar { height: 8px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
    
    .gallery-card {
      min-width: 600px;
      scroll-snap-align: start;
      :deep(.el-card__body) { padding: 12px; }
      
      .image-block {
        height: 340px;
        background: rgba(0,0,0,0.3);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        overflow: hidden;

        .arch-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }
      
      .image-caption {
        font-size: 13px;
        color: var(--el-text-color-regular);
        text-align: center;
        font-family: 'Fira Code', monospace;
      }
    }
  }
}

.project-content {
  padding: 0 24px;
}
</style>
