import { get, post, del } from '../index'

/**
 * @description 获取项目经验列表（支持分页）
 * @param {Object} params - 查询参数 { page, pageSize } 等
 * @returns {Promise}
 */
export const getProjectList = (params) => get('/project/list', params)

/**
 * @description 获取单个项目的详细介绍
 * @param {String|Number} id - 项目 ID
 * @returns {Promise}
 */
export const getProjectDetail = (id) => get(`/project/${id}`)

/**
 * @description 新增或更新项目配置
 * @param {Object} data - 项目实体数据
 * @returns {Promise}
 */
export const saveProject = (data) => post('/project/save', data)

/**
 * @description 删除指定的项目
 * @param {String|Number} id - 项目 ID
 * @returns {Promise}
 */
export const deleteProject = (id) => del(`/project/${id}`)
