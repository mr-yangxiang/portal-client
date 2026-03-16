<template>
  <div class="rich-editor-wrapper">
    <!-- 工具栏 -->
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <!-- 编辑区域 -->
    <Editor
      class="editor-content"
      v-model="htmlContent"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import { shallowRef, ref, onBeforeUnmount, watch } from 'vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 wangEditor 样式
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { uploadFile } from '@/api/modules/common'
import { ElMessage } from 'element-plus'

// 接收外部的 v-model 配置
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请在此输入内容...'
  }
})

const emit = defineEmits(['update:modelValue'])

// 本地模型绑定，由于 WangEditor 初次赋值可能有个小的生命周期流转，设定 fallback
const htmlContent = ref(props.modelValue || '')

// 监听外部传参的刷新（比如编辑模式回显了数据）
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== htmlContent.value) {
      htmlContent.value = newVal
    }
  }
)

// 编辑器实例引用
const editorRef = shallowRef()
const mode = ref('default') // simple 或者是 default

// 工具栏与编辑器配置
const toolbarConfig = {
  // 隐藏全屏、隐藏网络图片菜单（避免用户插入 base64 或外部失效外链）
  excludeKeys: ['fullScreen', 'insertImage', 'group-image']
}

// 需要显式将 'uploadImage' 追加到配置中（如果排除了 group-image 的话可以直接注册 uploadImage）
toolbarConfig.insertKeys = {
  index: 22, // 插入在适当的索引位置
  keys: ['uploadImage']
}

const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {
    // 拦截默认上传，走系统 API
    uploadImage: {
      base64LimitSize: 0, // 强制全部走系统上传通道，0kb以下的也不转 base64
      async customUpload(file, insertFn) {
        try {
          // 调用统一的上传接口
          const res = await uploadFile(file)
          
          // api/index.js 的 interceptors 已经返回了 response.data，因此 res 结构即为 { code: 200, data: { url: ... } }
          if (res && res.code === 200 && res.data && res.data.url) {
            // 向编辑器正式插入该真实的上传返回网络路径
            insertFn(res.data.url, file.name, res.data.url)
          } else {
            ElMessage.error(res?.message || '图片上传失败')
          }
        } catch (e) {
          console.error('富文本图片上传出错:', e)
          ElMessage.error('图片服务端接口报错')
        }
      }
    }
  }
}

// 实例成功创建
const handleCreated = (editor) => {
  editorRef.value = editor
}

// 每次输入或更改样式触发向外抛出 HTML
const handleChange = (editor) => {
  emit('update:modelValue', editor.getHtml())
}

// 组件卸载时销毁编辑器实例
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style lang="scss" scoped>
.rich-editor-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--nexus-glass-bg, rgba(30, 35, 42, 0.6));
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(15, 18, 22, 0.8) !important;
  
  :deep(.w-e-toolbar) {
    background-color: transparent !important;
    .w-e-bar-item {
      button {
        color: var(--el-text-color-primary);
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
      .active {
        background-color: rgba(255, 255, 255, 0.15);
      }
    }
    .w-e-bar-divider {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
}

.editor-content {
  flex: 1;
  min-height: 500px; /* 默认最低高度 */
  overflow-y: hidden;
  background-color: rgba(15, 18, 22, 0.8) !important; // 暗黑背景

  // 深度覆盖 WangEditor 内部编辑器样式以迎合赛博极客风
  :deep(.w-e-text-container) {
    background-color: transparent !important;
    color: var(--el-text-color-primary) !important;
    
    // 内容区的字体设置
    * {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    
    // 代码块覆写
    pre {
      background-color: #1e1e1e;
      border: 1px solid #333;
      code {
        font-family: 'Fira Code', monospace;
      }
    }
    
    // 占位符颜色
    [data-placeholder]::before {
      color: rgba(255, 255, 255, 0.2) !important;
    }
  }
}
</style>
