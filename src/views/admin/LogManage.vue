<!-- 
  操作日志页面
  @description 管理后台操作日志列表，展示系统审计日志记录
  @author yx
-->
<template>
  <div class="log-manage-container">
    <h2 class="page-title">操作日志</h2>
    <!-- 日志数据表格 -->
    <AdminTable :data="logData" :loading="loading" :total="total">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="operate_type" label="操作类型" width="150" />
      <el-table-column prop="operator_name" label="操作人" width="120" />
      <el-table-column prop="ip_address" label="IP 地址" width="150" />
      <el-table-column prop="detail" label="详情" show-overflow-tooltip />
      <el-table-column prop="created_at" label="操作时间" width="180" />
    </AdminTable>
  </div>
</template>

<script setup>
/**
 * 操作日志页 - 逻辑层
 * 从后端接口加载审计日志列表
 */
import { ref, onMounted } from 'vue'
import { getLogList } from '@/api/modules/sys'
import AdminTable from '@/components/AdminTable.vue'

/** 日志列表数据 */
const logData = ref([])
/** 表格加载状态 */
const loading = ref(false)
/** 数据总条数 */
const total = ref(0)

/**
 * 获取操作日志列表
 * 接口：GET /common/log/list
 */
const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await getLogList()
    logData.value = res.data.list || res.data.items || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data.total || 0
  } catch (e) {
    console.error('操作日志获取失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.page-title { font-size: 20px; font-family: 'Fira Code', monospace; font-weight: 700; color: var(--el-color-primary); margin: 0 0 20px 0; }
</style>
