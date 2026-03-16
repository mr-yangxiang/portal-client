import { get, post, del } from '../index'

/**
 * @description 提取所有技术标签列表（作用于首页云标签和管理后台）
 * @returns {Promise}
 */
export const getTagList = () => get('/tag/list')

/**
 * @description 增加或更新技术标签
 * @param {Object} data - 标签信息 { id, tag_name, tag_color }
 * @returns {Promise}
 */
export const saveTag = (data) => post('/tag/save', data)

/**
 * @description 删除选定的技术标签
 * @param {String|Number} id - 标签 ID
 * @returns {Promise}
 */
export const deleteTag = (id) => del(`/tag/${id}`)
