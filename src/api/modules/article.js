import { get, post, del } from '../index'

/**
 * @description 获取文章列表数据（支持分页搜索）
 * @param {Object} params - 查询参数 { page, pageSize, keyword, categoryId }
 * @returns {Promise}
 */
export const getArticleList = (params) => get('/article/list', params)

/**
 * @description 获取单篇文章详情
 * @param {String|Number} id - 文章 ID
 * @returns {Promise}
 */
export const getArticleDetail = (id) => get(`/article/${id}`)

/**
 * @description 新增或更新文章信息
 * @param {Object} data - 文章实体数据
 * @returns {Promise}
 */
export const saveArticle = (data) => post('/article/save', data)

/**
 * @description 删除文章
 * @param {String|Number} id - 文章 ID
 * @returns {Promise}
 */
export const deleteArticle = (id) => del(`/article/${id}`)
