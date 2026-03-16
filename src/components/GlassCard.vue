<template>
  <el-card class="glass-card" :shadow="shadow" :body-style="bodyStyle">
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
  </el-card>
</template>

<script setup>
defineProps({
  shadow: {
    type: String,
    default: 'hover'
  },
  bodyStyle: {
    type: Object,
    default: () => ({ padding: '20px' })
  }
})
</script>

<style scoped lang="scss">
.glass-card {
  background: var(--nexus-glass-bg, rgba(30, 30, 30, 0.6));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: var(--el-text-color-primary);
  /* 使用 Element Plus 未覆盖的高级毛玻璃动画 */
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* Element Plus 内部颜色重写 */
  :deep(.el-card__header) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &.is-hover-shadow:hover,
  &:hover {
    box-shadow: 0 12px 40px 0 rgba(0, 255, 170, 0.15) !important;
    transform: translateY(-4px);
    z-index: 10;
  }
}
</style>
