import { get, post, del } from '../index'

/**
 * @description 获取所有的文章分类列表
 * @returns {Promise}
 */
export const getCategoryList = () => get('/category/list')

/**
 * @description 新增或保存相关的分类信息
 * @param {Object} data - 分类表单 { id, category_name, sort_order }
 * @returns {Promise}
 */
export const saveCategory = (data) => post('/category/save', data)

/**
 * @description 删除选中的分类
 * @param {String|Number} id - 分类 ID
 * @returns {Promise}
 */
export const deleteCategory = (id) => del(`/category/${id}`)
