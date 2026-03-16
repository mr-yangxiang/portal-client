<!-- 
  项目管理页面
  @description 管理后台项目列表，支持项目的新增、编辑和下线操作
  @author yx
-->
<template>
  <div class="project-manage-container">
    <h2 class="page-title">项目管理</h2>
    <div style="margin-bottom: 20px;">
      <el-button type="success" plain @click="handleAdd"><el-icon><Plus /></el-icon> 新增项目</el-button>
    </div>
    <!-- 项目数据表格 -->
    <AdminTable 
      :data="projects" 
      :loading="loading" 
      :total="total" 
      :pageList="queryParams.page" 
      :sizeList="queryParams.size" 
      @update:pageList="queryParams.page = $event"
      @update:sizeList="queryParams.size = $event"
      @refresh="fetchProjects">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="project_name" label="项目名称" width="200" />
      <el-table-column prop="description" label="项目描述" show-overflow-tooltip />
      <el-table-column prop="category_name" label="分类" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.category_name" size="small" effect="dark" type="info">{{ scope.row.category_name }}</el-tag>
          <span v-else>—</span>
        </template>
      </el-table-column>
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
      :title="isEdit ? '编辑项目' : '新增项目'"
      width="560px"
      destroy-on-close
      class="glass-dialog"
    >
      <el-form :model="dialogForm" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="dialogForm.project_name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="dialogForm.description" type="textarea" :rows="3" placeholder="简短的一段介绍" />
        </el-form-item>
        <el-form-item label="分类 ID">
          <el-input-number v-model="dialogForm.category_id" :min="1" />
        </el-form-item>
        <el-form-item label="项目网址">
          <el-input v-model="dialogForm.preview_url" placeholder="http://..." />
        </el-form-item>
        <el-form-item label="开源地址">
          <el-input v-model="dialogForm.github_url" placeholder="https://github.com/..." />
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
 * 项目管理页 - 逻辑层
 * 从后端接口加载项目列表，支持弹窗式增删改操作
 */
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getProjectList, saveProject, deleteProject } from '@/api/modules/project'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminTable from '@/components/AdminTable.vue'

/** 项目列表数据 */
const projects = ref([])
/** 表格加载状态 */
const loading = ref(false)
/** 数据总条数 */
const total = ref(0)
/** 弹窗显示状态 */
const dialogVisible = ref(false)
/** 是否为编辑模式 */
const isEdit = ref(false)
/** 提交中状态 */
const submitting = ref(false)

const queryParams = reactive({
  page: 1,
  size: 10
})

/** 弹窗表单数据 */
const dialogForm = reactive({
  id: null,
  project_name: '',
  description: '',
  category_id: 1,
  preview_url: '',
  github_url: ''
})

/**
 * 获取项目列表
 * 接口：GET /project/list
 */
const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await getProjectList({ page: queryParams.page, pageSize: queryParams.size })
    projects.value = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data.total || 0
  } catch (e) {
    console.error('项目列表获取失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})

const resetForm = () => {
  dialogForm.id = null
  dialogForm.project_name = ''
  dialogForm.description = ''
  dialogForm.category_id = 1
  dialogForm.preview_url = ''
  dialogForm.github_url = ''
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogForm.id = row.id
  dialogForm.project_name = row.project_name
  dialogForm.description = row.description || ''
  dialogForm.category_id = row.category_id || 1
  dialogForm.preview_url = row.preview_url || ''
  dialogForm.github_url = row.github_url || ''
  isEdit.value = true
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!dialogForm.project_name || !dialogForm.description || !dialogForm.category_id) {
    ElMessage.error('名称、描述和分类 ID 属于必填项目')
    return
  }
  submitting.value = true
  try {
    await saveProject({
      id: dialogForm.id || undefined,
      project_name: dialogForm.project_name,
      description: dialogForm.description,
      category_id: dialogForm.category_id,
      preview_url: dialogForm.preview_url,
      github_url: dialogForm.github_url
    })
    ElMessage.success(isEdit.value ? '项目更新成功' : '项目发布成功')
    dialogVisible.value = false
    fetchProjects()
  } catch (e) {
    console.error('项目发布失败:', e)
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除项目「${row.project_name}」吗？`, '删除警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteProject(row.id)
      ElMessage.success('项目已彻底删除')
      fetchProjects()
    } catch (e) {
      console.error('项目删除失败:', e)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.page-title { font-size: 20px; font-family: 'Fira Code', monospace; font-weight: 700; color: var(--el-color-primary); margin: 0 0 20px 0; }
</style>
