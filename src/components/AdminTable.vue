<template>
  <div class="admin-table-container">
    <!-- 顶部操作区插槽 -->
    <div class="table-header-actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>

    <!-- 核心数据表格 -->
    <el-table
      v-loading="loading"
      :data="data"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      class="custom-glass-table"
    >
      <slot></slot>
    </el-table>

    <!-- 底部分页区 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  pageList: {
    type: Number,
    default: 1
  },
  sizeList: {
    type: Number,
    default: 10
  },
  showPagination: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:pageList', 'update:sizeList', 'refresh', 'selection-change'])

const currentPage = ref(props.pageList)
const pageSize = ref(props.sizeList)

watch(() => props.pageList, (val) => { currentPage.value = val })
watch(() => props.sizeList, (val) => { pageSize.value = val })

const handleSizeChange = (val) => {
  pageSize.value = val
  emit('update:sizeList', val)
  emit('refresh')
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  emit('update:pageList', val)
  emit('refresh')
}
const handleSelectionChange = (val) => {
  emit('selection-change', val)
}
</script>

<style lang="scss" scoped>
.admin-table-container {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .table-header-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-bottom: 8px;
  }

  /* 表格的高级玻璃拟物化定制 */
  :deep(.custom-glass-table) {
    --el-table-bg-color: transparent !important;
    --el-table-tr-bg-color: transparent !important;
    --el-table-header-bg-color: rgba(255, 255, 255, 0.03) !important;
    --el-table-row-hover-bg-color: rgba(0, 255, 170, 0.08) !important;
    --el-table-border-color: rgba(255, 255, 255, 0.08) !important;
    --el-table-border: 1px solid var(--el-table-border-color) !important;
    
    background: var(--nexus-glass-bg, rgba(30, 30, 30, 0.4));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    overflow: hidden;

    th.el-table__cell {
      background-color: var(--el-table-header-bg-color) !important;
      color: var(--el-text-color-primary) !important;
      font-weight: 600;
      border-bottom: var(--el-table-border) !important;
    }

    td.el-table__cell, th.el-table__cell.is-leaf {
      border-bottom: var(--el-table-border) !important;
    }

    &::before, &::after {
      display: none; /* 去除原本表格外边框多余的线条 */
    }
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;

    /* 分页器的极客风暗色改造 */
    :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
      background-color: var(--el-color-primary) !important;
      color: #000 !important;
      font-weight: bold;
    }
    :deep(.el-pagination.is-background .btn-next),
    :deep(.el-pagination.is-background .btn-prev),
    :deep(.el-pagination.is-background .el-pager li) {
      background-color: rgba(255, 255, 255, 0.05) !important;
      color: var(--el-text-color-primary);
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      &:hover {
        color: var(--el-color-primary) !important;
        border-color: var(--el-color-primary) !important;
      }
    }
    
    :deep(.el-pagination__total),
    :deep(.el-pagination__jump) {
      color: var(--el-text-color-regular);
    }
    :deep(.el-input__inner) {
      color: var(--el-text-color-primary);
      background-color: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
