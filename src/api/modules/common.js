import http from '../index'

// ==============================
// 基础公共服务接口
// ==============================

/**
 * @description 用于提交文件流数据，例如富文本的图片上传拦截
 * @param {File} file - 选取系统内的 File 文件对象
 * @returns {Promise} 上传完毕后返回远程 URL 对象
 */
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post('/common/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
