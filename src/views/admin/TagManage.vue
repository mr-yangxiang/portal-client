<!-- 
  标签管理页面
  @description 管理后台标签列表（标签云展示），支持标签的新增、编辑和删除操作
  @author yx
-->
<template>
  <div class="tag-manage-container">
    <h2 class="page-title">标签管理</h2>
    <div style="margin-bottom: 20px;">
      <el-button type="success" plain @click="handleAdd"><el-icon><Plus /></el-icon> 新增标签</el-button>
    </div>
    
    <!-- 标签云展示 -->
    <GlassCard>
      <div class="tag-cloud">
        <el-tag
          v-for="tag in tags"
          :key="tag.id"
          :color="tag.tag_color || ''"
          effect="dark"
          closable
          class="geek-tag"
          @click="handleEdit(tag)"
          @close="handleClose(tag)"
        >
          #{{ tag.tag_name }}
        </el-tag>
        <!-- 无数据提示 -->
        <span v-if="tags.length === 0" style="color: var(--el-text-color-regular);">暂无标签</span>
      </div>
    </GlassCard>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
      width="420px"
      destroy-on-close
      class="glass-dialog"
    >
      <el-form :model="dialogForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="dialogForm.tag_name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签颜色">
          <el-color-picker v-model="dialogForm.tag_color" show-alpha />
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
 * 标签管理页 - 逻辑层
 * 从后端接口加载标签列表，以标签云形式展示，支持弹窗式新增、编辑和删除
 */
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { getTagList, saveTag, deleteTag } from '@/api/modules/tag'
import { ElMessage, ElMessageBox } from 'element-plus'
import GlassCard from '@/components/GlassCard.vue'

/** 标签列表数据 */
const tags = ref([])
/** 弹窗显示状态 */
const dialogVisible = ref(false)
/** 是否为编辑模式 */
const isEdit = ref(false)
/** 提交中状态 */
const submitting = ref(false)

/** 弹窗表单数据 */
const dialogForm = reactive({
  id: null,
  tag_name: '',
  tag_color: '#00cc88'
})

/**
 * 获取标签列表
 * 接口：GET /tag/list
 */
const fetchTags = async () => {
  try {
    const res = await getTagList()
    tags.value = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
  } catch (e) {
    console.error('标签列表获取失败:', e)
  }
}

onMounted(() => {
  fetchTags()
})

/** 重置弹窗表单 */
const resetForm = () => {
  dialogForm.id = null
  dialogForm.tag_name = ''
  dialogForm.tag_color = '#00cc88'
}

/** 新增标签 */
const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

/**
 * 编辑标签（点击标签触发）
 * @param {Object} tag 标签数据对象
 */
const handleEdit = (tag) => {
  dialogForm.id = tag.id
  dialogForm.tag_name = tag.tag_name
  dialogForm.tag_color = tag.tag_color || '#00cc88'
  isEdit.value = true
  dialogVisible.value = true
}

/** 提交新增/编辑表单 */
const handleSubmit = async () => {
  if (!dialogForm.tag_name) {
    ElMessage.error('标签名称不能为空')
    return
  }
  submitting.value = true
  try {
    await saveTag({
      id: dialogForm.id || undefined,
      tag_name: dialogForm.tag_name,
      tag_color: dialogForm.tag_color
    })
    ElMessage.success(isEdit.value ? '标签更新成功' : '标签新增成功')
    dialogVisible.value = false
    fetchTags()
  } catch (e) {
    console.error('标签保存失败:', e)
  } finally {
    submitting.value = false
  }
}

/**
 * 删除标签（点击 x 触发）
 * @param {Object} tag 标签数据对象
 */
const handleClose = (tag) => {
  ElMessageBox.confirm(`确认删除标签「${tag.tag_name}」吗？`, '删除确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTag(tag.id)
      ElMessage.success('标签已删除')
      fetchTags()
    } catch (e) {
      console.error('标签删除失败:', e)
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px;
}

.geek-tag {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.geek-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 170, 0.3);
}
</style>
