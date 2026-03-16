<!-- 
  文章管理页面
  @description 管理后台文章列表，支持关键词搜索、分类筛选、分页查询、批量删除
  @author yx
-->
<template>
  <div class="article-manage-container">
    <h2 class="page-title">文章管理</h2>

    <!-- 筛选条件区 -->
    <GlassCard class="filter-card">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="搜索标题或内容" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryParams.categoryId" placeholder="全部" clearable style="width: 150px">
            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.category_name" :value="String(cat.id)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </GlassCard>

    <!-- 文章数据表格 -->
    <AdminTable :data="tableData" :loading="loading" :total="total" :pageList="queryParams.page"
      :sizeList="queryParams.size" @update:pageList="queryParams.page = $event"
      @update:sizeList="queryParams.size = $event" @refresh="fetchData" @selection-change="handleSelectionChange">
      <!-- 表格顶部操作按钮 -->
      <template #actions>
        <el-button type="success" plain @click="$router.push('/admin/article-edit')">
          <el-icon>
            <Plus />
          </el-icon> 新增文章
        </el-button>
        <el-button type="danger" plain :disabled="!selectedIds.length" @click="handleBatchDelete">
          <el-icon>
            <Delete />
          </el-icon> 批量删除
        </el-button>
      </template>

      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip>
        <template #default="scope">
          <span class="highlight-text">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="category_name" label="分类" width="120">
        <template #default="scope">
          <el-tag size="small" effect="dark" type="info">{{ scope.row.category_name || scope.row.categoryName || '未分类'
            }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="view_count" label="浏览量" width="100">
        <template #default="scope">
          <span style="font-family: 'Fira Code', monospace">{{ scope.row.view_count || scope.row.views || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ scope.row.created_at || scope.row.createTime || '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" link
            @click="$router.push(`/admin/article-edit?id=${scope.row.id}`)">编辑</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </AdminTable>
  </div>
</template>

<script setup>
/**
 * 文章管理页 - 逻辑层
 * 负责文章列表的查询、筛选、分页和批量操作
 */
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticleList, deleteArticle } from '@/api/modules/article'
import { getCategoryList } from '@/api/modules/category'
import GlassCard from '@/components/GlassCard.vue'
import AdminTable from '@/components/AdminTable.vue'

/** 表格加载状态 */
const loading = ref(false)
/** 表格数据列表 */
const tableData = ref([])
/** 数据总条数（用于分页） */
const total = ref(0)
/** 已选中的文章 ID 数组（用于批量操作） */
const selectedIds = ref([])
/** 分类列表（从接口获取，用于筛选下拉框） */
const categoryList = ref([])

/** 查询参数（关键词、分类ID、分页） */
const queryParams = reactive({
  keyword: '',
  categoryId: '',
  page: 1,
  size: 10
})

/** 触发搜索（重置到第1页） */
const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

/** 重置筛选条件并重新查询 */
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.categoryId = ''
  handleSearch()
}

/**
 * 表格选中项变化回调
 * @param {Array} val 选中的行数据数组
 */
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

/**
 * 获取文章列表数据
 * 接口：GET /article/list
 */
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getArticleList({
      page: queryParams.page,
      pageSize: queryParams.size,
      keyword: queryParams.keyword,
      categoryId: queryParams.categoryId
    })
    tableData.value = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data.total || 0
  } catch (e) {
    console.error('文章列表获取失败:', e)
  } finally {
    loading.value = false
  }
}

/**
 * 获取分类列表（用于筛选下拉框）
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
 * 删除单篇文章（二次确认）
 */
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除文章「${row.title}」吗？`, '提示', { type: 'warning' })
    await deleteArticle(row.id)
    ElMessage.success('文章删除成功！')
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error('删除失败:', e)
  }
}

/**
 * 批量删除文章
 */
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 篇文章吗？`, '提示', { type: 'warning' })
    for (const id of selectedIds.value) {
      await deleteArticle(id)
    }
    ElMessage.success('批量删除成功！')
    selectedIds.value = []
    fetchData()
  } catch (e) {
    if (e !== 'cancel') console.error('批量删除失败:', e)
  }
}

onMounted(() => {
  fetchData()
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.article-manage-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-title {
  font-size: 20px;
  font-family: 'Fira Code', monospace;
  font-weight: 700;
  color: var(--el-color-primary);
  margin: 0;
  letter-spacing: 1px;
}

.filter-card {
  margin-bottom: 4px;

  :deep(.el-card__body) {
    padding: 16px 20px 0 20px;
  }
}

.highlight-text {
  color: var(--el-text-color-primary);
  font-weight: 500;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary);
  }
}
</style>
