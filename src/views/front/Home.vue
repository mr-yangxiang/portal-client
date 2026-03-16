<!-- 
  前台首页
  @description 门户系统首页着陆页，展示大屏标题、技术标签、快捷入口和最新文章列表
  @author yx
-->
<template>
  <div class="front-page-container">
    <!-- 全屏动态背景 -->
    <div class="cyber-bg">
      <div class="grid"></div>
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
    </div>

    <!-- 顶部极简导航 -->
    <header class="glass-nav">
      <div class="nav-content">
        <div class="logo">NEXUS</div>
        <nav class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/articles">文章</router-link>
          <router-link to="/resume">简历</router-link>
          <a href="https://github.com" target="_blank" class="github-link">GitHub<el-icon><CopyDocument /></el-icon></a>
        </nav>
      </div>
    </header>

    <!-- 首页着陆大屏 -->
    <main class="landing-hero">
      <div class="hero-content">
        <h1 class="glitch" data-text="NEXUS">NEXUS</h1>
        <p class="subtitle">基于 Vue3 与 Node.js 的轻量级个人门户系统</p>
        
        <div class="tech-tags" v-if="parsedTechTags.length > 0">
          <span class="tech-tag" v-for="tag in parsedTechTags" :key="tag">
            {{ tag }}
          </span>
        </div>

        <div class="hero-actions">
          <el-button class="cyber-btn primary" @click="$router.push('/articles')">
            浏览文章 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </main>

    <!-- 最近更新区域 -->
    <section class="recent-updates">
      <h2 class="section-title">最新文章</h2>
      <el-row :gutter="24">
        <el-col :span="8" v-for="item in recentArticles" :key="item.id">
          <GlassCard shadow="hover" class="article-preview-card" @click="$router.push(`/article/${item.id}`)">
            <div class="cat-label">{{ item.category_name || 'SYSTEM' }}</div>
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-desc">{{ item.summary || '暂无摘要' }}</p>
            <div class="card-meta">
              <span><el-icon><Calendar /></el-icon> {{ (item.created_at || '').split(' ')[0] }}</span>
              <span><el-icon><View /></el-icon> {{ item.view_count || 0 }}</span>
            </div>
          </GlassCard>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup>
/**
 * 前台首页 - 逻辑层
 * 页面加载时从后端获取最新3篇文章展示在首页卡片区域
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Calendar, View, CopyDocument } from '@element-plus/icons-vue'
import { getArticleList } from '@/api/modules/article'
import { getProfile, recordVisit } from '@/api/modules/sys'
import GlassCard from '@/components/GlassCard.vue'

/** 路由实例 */
const router = useRouter()
/** 最新文章列表（首页展示最多3篇） */
const recentArticles = ref([])

/** 首页个人配置及标签 */
const profile = ref({
  tech_tags: ''
})

const parsedTechTags = computed(() => {
  if (profile.value.tech_tags) {
    return profile.value.tech_tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return [] // 用户没有配置技术栈时，应直接返回空数组
})

/** 获取个人配置加载首页大屏标签 */
const fetchProfile = async () => {
  try {
    const res = await getProfile()
    if (res.data) profile.value = res.data
  } catch (e) {
    console.error('配置获取失败:', e)
  }
}

/**
 * 页面挂载时获取最新文章
 * 接口：GET /article/list?page=1&size=3
 */
onMounted(async () => {
  fetchProfile()
  recordVisit({ page_path: '/' }).catch(() => {})
  try {
    const res = await getArticleList({ page: 1, pageSize: 3 })
    recentArticles.value = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
  } catch (e) {
    console.error('最新文章获取失败:', e)
  }
})

</script>

<style lang="scss" scoped>
.front-page-container {
  min-height: 100vh;
  background-color: var(--nexus-bg-color);
  color: var(--el-text-color-primary);
  position: relative;
  overflow-x: hidden;
}

/* 酷炫赛博朋克背景 */
.cyber-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  .grid {
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    transform: perspective(500px) rotateX(60deg);
    animation: grid-move 20s linear infinite;
  }

  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: float 10s infinite alternate;
  }
  
  .orb-1 {
    width: 400px; height: 400px;
    background: var(--el-color-primary);
    top: -100px; right: -100px;
  }
  
  .orb-2 {
    width: 500px; height: 500px;
    background: #388bfd;
    bottom: -200px; left: -100px;
    animation-delay: -5s;
  }
}

@keyframes grid-move {
  0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
  100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
}

@keyframes float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(30px) scale(1.1); }
}

/* 粘性玻璃导航 */
.glass-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(13, 17, 23, 0.6);
  backdrop-filter: var(--nexus-glass-blur);
  -webkit-backdrop-filter: var(--nexus-glass-blur);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  
  .nav-content {
    max-width: 1200px;
    margin: 0 auto;
    height: 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
  }

  .logo {
    font-family: 'Fira Code', monospace;
    font-size: 20px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    letter-spacing: 2px;
  }

  .nav-links {
    display: flex;
    gap: 32px;
    
    a {
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      color: var(--el-text-color-regular);
      text-decoration: none;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 6px;
      
      &:hover, &.router-link-active {
        color: var(--el-color-primary);
        text-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
      }
    }
  }
}

/* 首页大图区 */
.landing-hero {
  position: relative;
  z-index: 10;
  min-height: calc(100vh - 70px - 400px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 24px;

  .hero-content {
    text-align: center;
    max-width: 800px;

    .glitch {
      font-size: 5rem;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 24px;
      color: #fff;
      position: relative;
      /* 这里省略复杂的 glitch 动画，仅做排版 */
      text-shadow: 2px 2px 0 var(--el-color-primary), -2px -2px 0 #ff003c;
    }

    .subtitle {
      font-size: 1.25rem;
      color: var(--el-text-color-regular);
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .tech-tags {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 48px;

      .tech-tag {
        padding: 6px 16px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: 'Fira Code', monospace;
        font-size: 14px;
        transition: all 0.3s;
        
        &:hover {
          background: rgba(0, 255, 170, 0.1);
          border-color: var(--el-color-primary);
          color: var(--el-color-primary);
          box-shadow: 0 0 15px rgba(0, 255, 170, 0.3);
          transform: translateY(-2px);
        }
      }
    }

    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 24px;

      .cyber-btn {
        height: 50px;
        padding: 0 32px;
        font-family: 'Fira Code', monospace;
        font-size: 16px;
        font-weight: bold;
        border-radius: 4px;
        letter-spacing: 1px;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        
        &.primary {
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);
          color: #000;
          box-shadow: 0 0 20px rgba(0, 255, 170, 0.4);
          
          &:hover {
            box-shadow: 0 0 30px rgba(0, 255, 170, 0.8);
            transform: scale(1.05);
          }
        }

        &.plain {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          
          &:hover {
            border-color: #fff;
            background: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }
  }
}

/* 最新文章区 */
.recent-updates {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 80px 24px;

  .section-title {
    font-family: 'Fira Code', monospace;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 40px;
    display: inline-block;
    border-bottom: 2px solid var(--el-color-primary);
    padding-bottom: 8px;
  }

  .article-preview-card {
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;

    .cat-label {
      font-size: 12px;
      font-weight: bold;
      color: var(--el-color-primary);
      margin-bottom: 12px;
      font-family: 'Fira Code', monospace;
    }

    .card-title {
      font-size: 18px;
      color: #fff;
      margin: 0 0 12px 0;
      line-height: 1.4;
      font-weight: 600;
    }

    .card-desc {
      font-size: 14px;
      color: var(--el-text-color-regular);
      line-height: 1.6;
      margin: 0 0 24px 0;
      flex: 1;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      font-family: 'Fira Code', monospace;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
      
      span {
        display: flex;
        align-items: center;
        gap: 6px;
        i { margin-top: -2px; }
      }
    }
  }
}
</style>
