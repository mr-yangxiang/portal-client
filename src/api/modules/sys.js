import { get, post } from '../index'

// ==============================
// 登录 & 鉴权相关接口
// ==============================

/**
 * @description 账户登录验证，获取访问 Token
 * @param {Object} data - 登录包含的信息 { username, password }
 * @returns {Promise}
 */
export const login = (data) => post('/sys/login', data)

/**
 * @description 修改该管理账户的登录密码
 * @param {Object} data - 新旧密码 { oldPass, newPass }
 * @returns {Promise}
 */
export const changePassword = (data) => post('/sys/change-password', data)

// ==============================
// 个人档案 & 偏好相关接口
// ==============================

/**
 * @description 提取博主的个人档案及履历介绍
 * @returns {Promise}
 */
export const getProfile = () => get('/profile')

/**
 * @description 更新替换博主档案及履历配置
 * @param {Object} data - 完整档案数据包
 * @returns {Promise}
 */
export const saveProfile = (data) => post('/profile/save', data)

// ==============================
// 日志与面板统计相关接口
// ==============================

/**
 * @description 提取后台系统底层的审计操作日志
 * @param {Object} params - 日志可能自带的搜索与分页字段
 * @returns {Promise}
 */
export const getLogList = (params) => get('/common/log/list', params)

/**
 * @description 抓取工作台的访问数据与统计简报
 * @returns {Promise}
 */
export const getDashboardStats = () => get('/common/dashboard/stats')

// ==============================
// 访客流量相关接口
// ==============================

/**
 * @description 上报访客访问记录（前台页面自动调用，无需鉴权）
 * @param {Object} data - { page_path }
 * @returns {Promise}
 */
export const recordVisit = (data) => post('/common/visit', data)

/**
 * @description 获取近 N 天流量统计（PV/UV 折线图数据）
 * @param {Object} params - { days }
 * @returns {Promise}
 */
export const getVisitStats = (params) => get('/common/visit/stats', params)

/**
 * @description 获取今日访客概览
 * @returns {Promise}
 */
export const getTodayVisitSummary = () => get('/common/visit/today')
