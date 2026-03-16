<!-- 
  前台文章详情页
  @description 展示文章正文（Markdown 渲染）、元信息和自动生成的文章目录
  @author yx
-->
<template>
  <div class="article-detail-container">
    <header class="glass-nav">
      <div class="nav-content">
        <router-link to="/" class="logo">NEXUS</router-link>
        <div class="nav-actions">
          <el-button link class="back-btn" @click="$router.push('/articles')">
            <el-icon><Back /></el-icon> 返回列表
          </el-button>
        </div>
      </div>
    </header>

    <main class="detail-main">
      <article class="article-content-wrapper">
        <div class="article-header">
          <div class="cat">{{ article.category_name || article.categoryName || '未分类' }}</div>
          <h1 class="title">{{ article.title }}</h1>
          <div class="meta">
            <span><el-icon><User /></el-icon> 管理员</span>
            <span><el-icon><Calendar /></el-icon> {{ article.created_at || article.createTime || '' }}</span>
            <span><el-icon><View /></el-icon> {{ article.view_count || article.views || 0 }} 浏览</span>
          </div>
          <div class="tags">
            <span class="tag" v-for="(tag, index) in parsedTags" :key="index">
              #{{ typeof tag === 'object' ? tag.tag_name : tag.trim() }}
            </span>
          </div>
        </div>

        <GlassCard class="markdown-glass-wrapper">
          <MarkdownViewer :content="article.content || '内容加载失败，请稍后重试。'" />
        </GlassCard>
      </article>

      <aside class="toc-sidebar">
        <div class="sticky-wrapper">
          <GlassCard shadow="never">
            <div class="toc-title">文章目录</div>
            <ul class="toc-list" v-if="tocItems.length > 0">
              <li v-for="(item, index) in tocItems" :key="index"
                  :class="{ 'sub-item': item.level > 2 }">
                {{ item.text }}
              </li>
            </ul>
            <div v-else class="toc-empty">暂无目录</div>
          </GlassCard>
          
          <div class="sidebar-actions">
            <el-button type="success" circle size="large" class="action-btn popup" @click="handleShare" title="复制链接分享">
              <el-icon><Share /></el-icon>
            </el-button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Back, User, Calendar, View, Star, Share } from '@element-plus/icons-vue'
import { getArticleDetail } from '@/api/modules/article'
import { recordVisit } from '@/api/modules/sys'
import GlassCard from '@/components/GlassCard.vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const article = ref({
  title: '加载中...',
  category_name: '',
  created_at: '',
  view_count: 0,
  tags: [],
  content: ''
})

// 解析标签（兼容数组对象和逗号分隔字符串两种格式）
const parsedTags = computed(() => {
  const tags = article.value.tags
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string' && tags) return tags.split(',')
  return []
})

// 从文章 Markdown 内容中提取标题，生成目录
const tocItems = computed(() => {
  const content = article.value.content
  if (!content) return []
  
  const items = []
  // 匹配 ## 和 ### 标题
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (match) {
      items.push({
        level: match[1].length,
        text: match[2].trim()
      })
    }
  }
  return items
})

const fetchDetail = async () => {
  try {
    const id = route.params.id
    if (!id) return
    const res = await getArticleDetail(id)
    if (res.data) {
      article.value = res.data
    }
  } catch (e) {
    console.error('文章详情获取失败:', e)
  }
}

onMounted(() => {
  fetchDetail()
  recordVisit({ page_path: `/article/${route.params.id}` }).catch(() => {})
})

// 复制链接功能
const handleShare = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('文章链接已复制到剪贴板！')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制浏览器地址栏')
  }
}
</script>

<style lang="scss" scoped>
.article-detail-container {
  min-height: 100vh;
  background-color: var(--nexus-bg-color);
  background-image: radial-gradient(circle at top center, rgba(0, 255, 170, 0.03), transparent 60%);
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

  .back-btn {
    font-family: 'Fira Code', monospace;
    color: var(--el-text-color-primary);
    
    &:hover { color: var(--el-color-primary); }
  }
}

.detail-main {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.article-content-wrapper {
  flex: 1;
  min-width: 0;
  
  .article-header {
    margin-bottom: 32px;
    text-align: center;
    
    .cat {
      font-size: 12px;
      font-family: 'Fira Code', monospace;
      color: var(--el-color-primary);
      margin-bottom: 16px;
      letter-spacing: 2px;
    }
    
    .title {
      font-size: 36px;
      line-height: 1.3;
      color: #fff;
      margin: 0 0 24px 0;
      font-weight: 800;
      text-shadow: 0 0 20px rgba(0, 255, 170, 0.2);
    }
    
    .meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      color: var(--el-text-color-regular);
      font-size: 13px;
      font-family: 'Fira Code', monospace;
      margin-bottom: 24px;
      
      span { display: flex; align-items: center; gap: 6px; }
    }
    
    .tags {
      display: flex;
      justify-content: center;
      gap: 12px;
      .tag {
        font-size: 12px;
        color: rgba(255,255,255,0.6);
        background: rgba(255,255,255,0.05);
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
      }
    }
  }

  .markdown-glass-wrapper {
    :deep(.el-card__body) { padding: 40px; }
  }
}

.toc-sidebar {
  width: 260px;
  
  .sticky-wrapper {
    position: sticky;
    top: 90px;
  }
  
  .toc-title {
    font-family: 'Fira Code', monospace;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    font-size: 14px;
    letter-spacing: 1px;
    border-bottom: 1px dashed rgba(255,255,255,0.2);
    padding-bottom: 12px;
  }
  
  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      font-size: 13px;
      color: var(--el-text-color-regular);
      margin-bottom: 12px;
      cursor: pointer;
      line-height: 1.4;
      transition: color 0.2s;
      
      &:hover { color: #fff; }
      &.active {
        color: var(--el-color-primary);
        font-weight: 600;
      }
      &.sub-item {
        padding-left: 16px;
        font-size: 12px;
        color: rgba(255,255,255,0.5);
      }
    }
  }

  .toc-empty {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
  }

  .sidebar-actions {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    gap: 20px;
    
    .action-btn {
      width: 48px;
      height: 48px;
      font-size: 20px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      
      &:hover { transform: scale(1.1); }
      &.glow:hover { box-shadow: 0 0 20px rgba(56, 139, 253, 0.6); color: #388bfd; border-color: #388bfd; }
      &.popup:hover { box-shadow: 0 0 20px rgba(0, 255, 170, 0.6); color: var(--el-color-primary); border-color: var(--el-color-primary); }
    }
  }
}
</style>
