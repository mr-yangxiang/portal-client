<!-- 
  前台文章列表页
  @description 文章归档列表，支持按分类筛选、无限滚动分页加载
  @author yx
-->
<template>
  <div class="archive-container">
    <!-- 简易内嵌导航 -->
    <header class="glass-nav">
      <div class="nav-content">
        <router-link to="/" class="logo">NEXUS</router-link>
        <div class="nav-title">文章归档</div>
      </div>
    </header>

    <main class="archive-main">
      <div class="sidebar">
        <GlassCard>
          <div class="filter-header">筛选条件</div>
          <div class="filter-group">
            <div class="group-title">文章分类</div>
            <ul class="filter-list">
              <li :class="{ active: !selectedCategoryId }" @click="selectCategory(null)">全部分类</li>
              <li v-for="cat in categoryList" :key="cat.id"
                  :class="{ active: selectedCategoryId === cat.id }"
                  @click="selectCategory(cat.id)">
                {{ cat.category_name }}
              </li>
            </ul>
          </div>
        </GlassCard>
      </div>

      <div class="feed-content">
        <!-- 无限滚动流列表 -->
        <ul v-infinite-scroll="loadMore" class="infinite-list" :infinite-scroll-disabled="disabled">
          <li v-for="article in articleList" :key="article.id" class="list-item">
            <GlassCard shadow="hover" class="feed-card" @click="goToDetail(article.id)">
              <div class="card-left">
                <span class="date">{{ article.created_at || article.createTime || '' }}</span>
              </div>
              <div class="card-right">
                <div class="cat">{{ article.category_name || article.categoryName || '未分类' }}</div>
                <h3 class="title">{{ article.title }}</h3>
                <p class="desc">{{ article.summary || '暂无摘要，点击查看详情...' }}</p>
                <div class="tags">
                  <span class="tag" v-for="tag in (Array.isArray(article.tags) ? article.tags : (article.tags ? String(article.tags).split(',') : []))" :key="typeof tag === 'object' ? tag.id : tag">
                    #{{ typeof tag === 'object' ? tag.tag_name : tag.trim() }}
                  </span>
                </div>
              </div>
            </GlassCard>
          </li>
        </ul>
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon> 加载中...
        </div>
        <div v-if="noMore" class="no-more-state">— 已全部加载 —</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { getArticleList } from '@/api/modules/article'
import { recordVisit } from '@/api/modules/sys'
import { getCategoryList } from '@/api/modules/category'
import GlassCard from '@/components/GlassCard.vue'

const router = useRouter()

// 分类列表（从接口获取）
const categoryList = ref([])
const selectedCategoryId = ref(null)

const articleList = ref([])
const page = ref(1)
const size = ref(10)
const loading = ref(false)
const noMore = ref(false)
const disabled = computed(() => loading.value || noMore.value)

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categoryList.value = res.data || []
  } catch (e) {
    console.error('分类列表获取失败:', e)
  }
}

// 选择分类筛选
const selectCategory = (categoryId) => {
  if (selectedCategoryId.value === categoryId) return
  selectedCategoryId.value = categoryId
  // 重置列表并重新加载
  articleList.value = []
  page.value = 1
  noMore.value = false
  loadMore()
}

const loadMore = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  
  try {
    const params = { page: page.value, pageSize: size.value }
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value
    }
    const res = await getArticleList(params)
    const items = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
    
    if (items.length > 0) {
      articleList.value.push(...items)
      page.value += 1
      if (items.length < size.value) {
        noMore.value = true
      }
    } else {
      noMore.value = true
    }
  } catch (e) {
    console.error('文章列表获取失败:', e)
    noMore.value = true // 防止死循环
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  fetchCategories()
  recordVisit({ page_path: '/articles' }).catch(() => {})
})
</script>

<style lang="scss" scoped>
.archive-container {
  min-height: 100vh;
  background-color: var(--nexus-bg-color);
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
    align-items: center;
    padding: 0 24px;
    gap: 30px;
  }

  .logo {
    font-family: 'Fira Code', monospace;
    font-size: 18px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    text-decoration: none;
  }
  
  .nav-title {
    color: var(--el-color-primary);
    font-family: 'Fira Code', monospace;
    font-size: 14px;
    opacity: 0.8;
  }
}

.archive-main {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.sidebar {
  width: 280px;
  position: sticky;
  top: 100px;
  
  .filter-header {
    font-family: 'Fira Code', monospace;
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
  }
  
  .group-title {
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-bottom: 12px;
    letter-spacing: 1px;
  }
  
  .filter-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 10px 12px;
      margin-bottom: 4px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      color: var(--el-text-color-primary);
      transition: all 0.2s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      &.active {
        color: var(--el-color-primary);
        background: rgba(0, 255, 170, 0.1);
        font-weight: 500;
      }
      
      .badge {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-family: 'Fira Code', monospace;
      }
    }
  }
}

.feed-content {
  flex: 1;
  
  .infinite-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    .list-item {
      margin-bottom: 24px;
    }
  }
}

.feed-card {
  cursor: pointer;
  :deep(.el-card__body) {
    display: flex;
    padding: 0;
  }
  
  .card-left {
    width: 140px; /* 加宽以容纳 YYYY-MM-DD HH:mm:ss 或者换行 */
    background: rgba(0, 255, 170, 0.05);
    border-right: 1px dashed rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 10px;
    
    .date {
      font-family: 'Fira Code', monospace;
      font-size: 14px; /* 缩小原先巨大的数字，兼顾时间与日期的多行显示 */
      color: var(--el-color-primary);
      line-height: 1.4;
      word-wrap: break-word;
    }
  }
  
  .card-right {
    flex: 1;
    padding: 24px;
    
    .cat {
      font-size: 12px;
      color: var(--el-color-primary);
      font-family: 'Fira Code', monospace;
      margin-bottom: 8px;
    }
    .title {
      font-size: 20px;
      margin: 0 0 12px 0;
      color: #fff;
    }
    .desc {
      color: var(--el-text-color-regular);
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    .tags {
      display: flex;
      gap: 12px;
      
      .tag {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        font-family: 'Fira Code', monospace;
      }
    }
  }
}

.loading-state, .no-more-state {
  text-align: center;
  padding: 30px;
  color: var(--el-text-color-regular);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
}
.loading-state { color: var(--el-color-primary); }
</style>
