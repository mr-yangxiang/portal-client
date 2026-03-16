<template>
  <div class="markdown-body w-e-text" v-html="content"></div>
</template>

<script setup>
/**
 * 已从 Markdown 解析器升级为 Rich Text (HTML) 展示器
 * 保留原组件名是为了兼容既有引用，但内部移除了对 marked/highlight.js 的沉重依赖
 */
const props = defineProps({
  content: {
    type: String,
    required: true,
    default: ''
  }
})
</script>

<style lang="scss">
/* 针对该组件渲染出的 HTML 的全局挂载样式 */
.markdown-body {
  color: var(--el-text-color-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.7;
  font-size: 16px;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: #fff;
  }

  h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid var(--el-border-color-light); }
  h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid var(--el-border-color-light); }

  p { margin-top: 0; margin-bottom: 16px; }

  /* 代码块极简暗黑风格 */
  pre {
    background-color: #1e1e1e !important;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    margin-bottom: 16px;
  }

  code {
    font-family: 'Fira Code', Consolas, Monaco, monospace;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
  }

  img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    margin-bottom: 16px;
  }

  a {
    color: var(--el-color-primary);
    text-decoration: none;
    transition: all 0.2s;
    &:hover {
      text-decoration: underline;
      text-shadow: 0 0 8px rgba(0, 255, 170, 0.4);
    }
  }

  blockquote {
    border-left: 4px solid var(--el-color-primary);
    margin: 0 0 16px 0;
    padding: 10px 16px;
    color: var(--el-text-color-regular);
    background-color: rgba(0, 255, 170, 0.05); /* 利用品牌色的超低透明度 */
    border-radius: 0 8px 8px 0;
    
    p:last-child {
      margin-bottom: 0;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;

    th, td {
      border: 1px solid var(--el-border-color-light);
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: rgba(255, 255, 255, 0.05);
    }
    tr:nth-child(2n) {
      background-color: rgba(255, 255, 255, 0.02);
    }
  }
}
</style>
