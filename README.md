# Portal Client — 个人数字门户系统前端

基于 **Vue 3 + Vite** 构建的单页应用（SPA），采用 **暗色科技主题** 设计风格，包含前台访客展示和管理后台两大模块。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue 3（Composition API） | 3.4 |
| 构建工具 | Vite | 5.2 |
| UI 框架 | Element Plus | 2.6 |
| 图标库 | @element-plus/icons-vue | 2.3 |
| 路由 | Vue Router 4（HTML5 History） | 4.3 |
| 状态管理 | Pinia | 2.1 |
| HTTP 请求 | Axios | 1.6 |
| 富文本编辑器 | WangEditor 5 | 5.1 |
| 数据可视化 | ECharts | 6.0 |
| 样式预处理 | Sass | 1.72 |

## 目录结构

```
portal-client/
├── index.html                   # 入口 HTML
├── vite.config.js               # Vite 配置（别名、代理、端口）
├── package.json
├── dist/                        # 构建产物
└── src/
    ├── main.js                  # 应用入口（注册插件、全局图标、暗色模式）
    ├── App.vue                  # 根组件
    ├── index.css                # 全局基础样式
    ├── assets/
    │   └── dark-theme.scss      # 暗色主题 CSS 变量覆盖
    ├── api/                     # API 请求层
    │   ├── index.js             # Axios 实例封装（拦截器、Token 注入、统一错误处理）
    │   └── modules/             # 按业务域拆分的 API 模块
    │       ├── sys.js           # 登录、修改密码、仪表盘、审计日志、访客统计
    │       ├── article.js       # 文章 CRUD
    │       ├── project.js       # 项目 CRUD
    │       ├── category.js      # 分类 CRUD
    │       ├── tag.js           # 标签 CRUD
    │       └── common.js        # 文件上传
    ├── router/
    │   └── index.js             # 路由表 + 全局前置守卫（鉴权拦截）
    ├── stores/
    │   └── user.js              # Pinia Store（Token 持久化、侧边栏状态）
    ├── components/              # 全局复用组件
    │   ├── AdminTable.vue       # 后台通用数据表格（分页、搜索、操作列）
    │   ├── GlassCard.vue        # 毛玻璃卡片容器
    │   ├── RichEditor.vue       # WangEditor 富文本编辑器封装
    │   └── MarkdownViewer.vue   # Markdown 渲染展示组件
    └── views/                   # 页面视图
        ├── front/               # 前台访客页面
        │   ├── Home.vue         # 首页（个人简介 + 技术栈标签 + 文章/项目卡片）
        │   ├── ArticleList.vue  # 文章列表（分页 + 分类/标签筛选）
        │   ├── ArticleDetail.vue# 文章详情（富文本渲染 + 浏览量）
        │   ├── ProjectDetail.vue# 项目详情（架构图轮播 + 描述）
        │   └── Resume.vue       # 在线简历页
        └── admin/               # 管理后台页面
            ├── Login.vue        # 管理员登录
            ├── Layout.vue       # 后台布局框架（侧边栏 + 顶栏 + 内容区）
            ├── Dashboard.vue    # 仪表盘（统计卡片 + ECharts 流量图表）
            ├── ArticleManage.vue    # 文章管理（表格 + 搜索 + 批量操作）
            ├── ArticleEdit.vue      # 文章编辑（WangEditor 富文本）
            ├── ProjectManage.vue    # 项目管理
            ├── CategoryManage.vue   # 分类管理
            ├── TagManage.vue        # 标签管理（颜色选择器）
            ├── LogManage.vue        # 操作审计日志查看
            └── Settings.vue         # 系统设置（个人资料 + 头像上传）
```

## 快速开始

### 1. 环境准备

- **Node.js** ≥ 16
- **npm** 或 **yarn**
- 后端服务 `portal-server` 已启动在 `http://localhost:3000`

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式

```bash
npm run dev
```

启动后访问 **http://localhost:5173**，Vite 开发服务器会自动将 `/api` 请求代理到后端 `http://localhost:3000`。

### 4. 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可部署到 Nginx 等静态服务器。

### 5. 预览构建产物

```bash
npm run preview
```

## 页面路由

### 前台访客页面（无需登录）

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页（个人简介、技术栈、文章/项目卡片） |
| `/articles` | ArticleList | 文章列表（分页 + 分类/标签筛选） |
| `/article/:id` | ArticleDetail | 文章详情 |
| `/project/:id` | ProjectDetail | 项目详情 |
| `/resume` | Resume | 在线简历 |

### 管理后台页面（需登录鉴权）

| 路径 | 页面 | 说明 |
|------|------|------|
| `/admin/login` | Login | 管理员登录 |
| `/admin/dashboard` | Dashboard | 仪表盘（统计概览 + 流量图表） |
| `/admin/articles` | ArticleManage | 文章管理 |
| `/admin/article-edit` | ArticleEdit | 文章编辑 / 新增 |
| `/admin/projects` | ProjectManage | 项目管理 |
| `/admin/categories` | CategoryManage | 分类管理 |
| `/admin/tags` | TagManage | 标签管理 |
| `/admin/logs` | LogManage | 操作审计日志 |
| `/admin/settings` | Settings | 系统设置（个人资料 + 偏好） |

## 核心机制

### API 层封装

- Axios 实例统一配置 `baseURL: '/api/v1'`
- **请求拦截器**：自动注入 `Authorization: Bearer <token>` 请求头
- **响应拦截器**：统一处理错误码，Token 过期自动清除并跳转登录页
- 按业务域拆分为 6 个 API 模块，每个模块导出独立的请求函数

### 路由鉴权

- Vue Router 全局前置守卫 `beforeEach`
- 含 `meta.requiresAuth` 的路由需要 Token，无 Token 重定向到 `/admin/login`
- 已登录用户访问登录页自动跳转到仪表盘

### 状态管理

- Pinia Store 管理 Token 和侧边栏状态
- Token 持久化到 `localStorage`（key: `nexus_token`）
- 页面刷新自动恢复登录态

### 暗色主题

- `main.js` 强制启用 `document.documentElement.classList.add('dark')`
- Element Plus 暗色 CSS 变量 + 自定义 `dark-theme.scss` 覆盖

## 开发代理配置

`vite.config.js` 中配置了开发代理：

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

前端所有 `/api/*` 请求会被代理到后端服务。

## 生产部署

构建后的 `dist/` 目录为纯静态文件，部署时需配置反向代理：

**Nginx 参考配置：**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/portal-client/dist;

    # 前端路由 History 模式兜底
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理到 Node.js 后端
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源（上传文件）代理
    location /public/ {
        proxy_pass http://127.0.0.1:3000;
    }
}
```
