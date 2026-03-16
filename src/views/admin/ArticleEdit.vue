<!-- 
  文章编辑页面
  @description 文章新增/编辑页面，支持 Markdown 双栏编辑与实时预览
  @author yx
-->
<template>
  <div class="article-edit-container">
    <!-- 顶部标题输入 + 发布按钮 -->
    <div class="edit-header">
      <el-input v-model="form.title" placeholder="请输入文章标题..." class="title-input" size="large" />
      <el-button type="primary" :loading="publishing" @click="handlePublish" class="publish-btn">
        <el-icon>
          <Upload />
        </el-icon> 发布文章
      </el-button>
    </div>

    <!-- 分类和标签选择区 -->
    <div class="edit-meta">
      <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 200px" class="meta-select">
        <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.category_name" :value="String(cat.id)" />
      </el-select>
      <el-select v-model="form.tagIds" multiple placeholder="选择标签" style="width: 300px" class="meta-select">
        <el-option v-for="tag in tagList" :key="tag.id" :label="tag.tag_name" :value="tag.id" />
      </el-select>
    </div>

    <!-- 富文本编辑区 -->
    <div class="editor-workspace">
      <RichEditor v-model="form.content" placeholder="在此开启您的灵感创作..." />
    </div>
  </div>
</template>

<script setup>
/**
 * 文章编辑页 - 逻辑层
 * 支持新增和编辑两种模式：
 * - 新增模式：直接进入空表单
 * - 编辑模式：URL 携带 ?id=xxx，自动加载文章数据回填
 */
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getArticleDetail, saveArticle } from '@/api/modules/article'
import { getCategoryList } from '@/api/modules/category'
import { getTagList } from '@/api/modules/tag'
import RichEditor from '@/components/RichEditor.vue'

/** 当前路由信息（用于获取编辑模式的文章 ID） */
const route = useRoute()

/** 分类列表（从接口获取） */
const categoryList = ref([])
/** 标签列表（从接口获取） */
const tagList = ref([])

/** 文章表单数据 */
const form = reactive({
  id: '',          // 文章 ID（编辑模式有值，新增模式为空）
  title: '',       // 文章标题
  categoryId: '',  // 文章分类 ID
  tagIds: [],      // 文章关联标签 ID 数组
  content: ''      // 文章 Markdown 内容
})

/**
 * 获取分类列表
 * 接口：GET /category/list
 */
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    categoryList.value = res.data || []
  } catch (e) {
    console.error('分类列表获取失败:', e)
  }
}

/**
 * 获取标签列表
 * 接口：GET /tag/list
 */
const fetchTags = async () => {
  try {
    const res = await getTagList()
    tagList.value = res.data || []
  } catch (e) {
    console.error('标签列表获取失败:', e)
  }
}

/**
 * 页面初始化
 * 加载分类/标签列表，如果是编辑模式则加载文章详情回填表单
 */
onMounted(async () => {
  // 并行加载分类和标签
  fetchCategories()
  fetchTags()

  // 判断是否为编辑模式
  const articleId = route.query.id
  if (articleId) {
    try {
      const res = await getArticleDetail(articleId)
      if (res.data) {
        form.id = res.data.id
        form.title = res.data.title
        form.categoryId = res.data.category_id ? String(res.data.category_id) : ''
        form.content = res.data.content
        // 回填标签（兼容对象数组格式）
        if (res.data.tags && res.data.tags.length > 0) {
          form.tagIds = res.data.tags.map(t => typeof t === 'object' ? t.id : t)
        }
        ElMessage.success('文章数据加载成功')
      }
    } catch (e) {
      console.error('文章详情获取失败:', e)
      ElMessage.error('文章数据加载失败: ' + e.message)
    }
  }
})

/** 发布按钮加载状态 */
const publishing = ref(false)

/**
 * 处理发布/更新操作
 * 校验必填字段后调用 POST /article/save 接口
 */
const handlePublish = async () => {
  if (!form.title || !form.content) {
    ElMessage.error('标题和内容不能为空')
    return
  }
  if (!form.categoryId) {
    ElMessage.error('请选择文章分类')
    return
  }

  publishing.value = true
  try {
    const payload = {
      id: form.id ? Number(form.id) : undefined,
      title: form.title,
      content: form.content,
      category_id: form.categoryId ? Number(form.categoryId) : undefined,
      tag_ids: form.tagIds && form.tagIds.length > 0
        ? form.tagIds.map(t => Number(t)).filter(n => !isNaN(n))
        : []
    }

    await saveArticle(payload)
    ElMessage.success(form.id ? '文章更新成功！' : '文章发布成功！')
  } catch (e) {
    console.error('发布失败:', e)
  } finally {
    publishing.value = false
  }
}

</script>

<style lang="scss" scoped>
.article-edit-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.edit-header {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;

  .title-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      background-color: rgba(30, 35, 42, 0.6) !important;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
      border-radius: 8px;
    }

    :deep(.el-input__inner) {
      color: var(--el-color-primary);
      font-size: 20px;
      font-weight: 700;
      font-family: 'Fira Code', monospace;

      &::placeholder {
        color: rgba(255, 255, 255, 0.2);
        font-weight: 400;
      }
    }
  }

  .publish-btn {
    font-family: 'Fira Code', monospace;
    font-weight: bold;
    letter-spacing: 1px;
    padding: 0 24px;
    box-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
  }
}

.edit-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  .meta-select {
    :deep(.el-input__wrapper) {
      background-color: rgba(30, 35, 42, 0.4);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important;
    }

    :deep(.el-input__inner) {
      font-family: 'Fira Code', monospace;
      color: var(--el-text-color-primary);
    }
  }
}

.editor-workspace {
  flex: 1;
  min-height: 0;
  
  /* 让外部容易拉伸满内部的 RichEditor */
  :deep(.rich-editor-wrapper) {
    height: 100%;
  }
}

/* 自定义暗色滚动条 */
.geek-scrollbar {
  :deep(::-webkit-scrollbar) {
    width: 6px;
  }

  :deep(::-webkit-scrollbar-track) {
    background: transparent;
  }

  :deep(::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
}
</style>
