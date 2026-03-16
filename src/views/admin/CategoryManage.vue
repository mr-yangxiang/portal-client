<!-- 
  分类管理页面
  @description 管理后台分类列表，支持分类的新增、编辑和删除操作
  @author yx
-->
<template>
  <div class="category-manage-container">
    <h2 class="page-title">分类管理</h2>
    <div style="margin-bottom: 20px;">
      <el-button type="success" plain @click="handleAdd"><el-icon><Plus /></el-icon> 新增分类</el-button>
    </div>
    <!-- 分类数据表格（不分页） -->
    <AdminTable
      :data="tableData"
      :showPagination="false"
      :loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="category_name" label="分类名称" />
      <el-table-column prop="sort_order" label="排序" width="100" />
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </AdminTable>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="460px"
      destroy-on-close
      class="glass-dialog"
    >
      <el-form :model="dialogForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="dialogForm.category_name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="dialogForm.sort_order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 分类管理页 - 逻辑层
 * 从后端接口加载分类列表，支持弹窗式新增、编辑和删除
 */
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getCategoryList, saveCategory, deleteCategory } from '@/api/modules/category'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminTable from '@/components/AdminTable.vue'

/** 分类列表数据 */
const tableData = ref([])
/** 表格加载状态 */
const loading = ref(false)
/** 弹窗显示状态 */
const dialogVisible = ref(false)
/** 是否为编辑模式 */
const isEdit = ref(false)
/** 提交中状态 */
const submitting = ref(false)

/** 弹窗表单数据 */
const dialogForm = reactive({
  id: null,
  category_name: '',
  sort_order: 0
})

/**
 * 获取分类列表
 * 接口：GET /category/list
 */
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    tableData.value = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
  } catch (e) {
    console.error('分类列表获取失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

/** 重置弹窗表单 */
const resetForm = () => {
  dialogForm.id = null
  dialogForm.category_name = ''
  dialogForm.sort_order = 0
}

/** 新增分类 */
const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

/**
 * 编辑分类
 * @param {Object} row 当前行分类数据
 */
const handleEdit = (row) => {
  dialogForm.id = row.id
  dialogForm.category_name = row.category_name
  dialogForm.sort_order = row.sort_order || 0
  isEdit.value = true
  dialogVisible.value = true
}

/** 提交新增/编辑表单 */
const handleSubmit = async () => {
  if (!dialogForm.category_name) {
    ElMessage.error('分类名称不能为空')
    return
  }
  submitting.value = true
  try {
    await saveCategory({
      id: dialogForm.id || undefined,
      category_name: dialogForm.category_name,
      sort_order: dialogForm.sort_order
    })
    ElMessage.success(isEdit.value ? '分类更新成功' : '分类新增成功')
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error('分类保存失败:', e)
  } finally {
    submitting.value = false
  }
}

/**
 * 删除分类
 * @param {Object} row 当前行分类数据
 */
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除分类「${row.category_name}」吗？`, '删除确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCategory(row.id)
      ElMessage.success('分类已删除')
      fetchData()
    } catch (e) {
      console.error('分类删除失败:', e)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-family: 'Fira Code', monospace;
  font-weight: 700;
  color: var(--el-color-primary);
  margin: 0 0 20px 0;
  letter-spacing: 1px;
}
</style>
