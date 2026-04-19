# 项目管理系统

项目与提案管理网站 — 以项目为顶层，提案归属项目下，支持多层级的项目规划和迭代管理。

**访问地址**: https://yeluo45.github.io/proposals-manager/

---

## 功能特性

- **项目→提案两层结构**：一个项目可包含多个提案，提案下是具体的设计/功能
- **项目列表展示**：卡片/表格双视图切换，分页浏览
- **项目名跳转链接**：点击项目名称直接跳转最新访问链接
- **实时搜索**：300ms 防抖，搜索项目名称、描述、提案名称、标签
- **多维筛选**：按类型（Web/App/Package）、按状态（Active/开发中/已归档）
- **新增项目**：自动生成项目ID（PRJ-YYYYMMDD-XXX格式）
- **新增提案**：在项目下添加提案，自动生成提案ID（P-YYYYMMDD-XXX格式）
- **编辑/删除**：支持项目和提案的完整 CRUD
- **一键复制**：复制访问链接/下载链接到剪贴板
- **GitHub 数据存储**：所有数据通过 GitHub API 持久化到仓库

---

## 数据格式

```json
{
  "version": 2,
  "projects": [
    {
      "id": "PRJ-YYYYMMDD-XXX",
      "name": "项目名称",
      "description": "项目描述",
      "url": "https://...",          // 项目最新访问链接，点击项目名跳转
      "gitRepo": "https://github.com/...",
      "createdAt": "YYYY-MM-DD",
      "updatedAt": "YYYY-MM-DD",
      "proposals": [
        {
          "id": "P-YYYYMMDD-XXX",
          "name": "提案名称",
          "description": "提案描述",
          "type": "web | app | package",
          "status": "active | in_dev | archived",
          "url": "https://...",
          "packageUrl": "https://...",
          "tags": ["标签1", "标签2"],
          "createdAt": "YYYY-MM-DD",
          "updatedAt": "YYYY-MM-DD"
        }
      ]
    }
  ]
}
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + Vite 5 |
| 样式 | Tailwind CSS |
| 数据层 | GitHub REST API |
| 部署 | GitHub Pages |

---

## 目录结构

```
proposals-manager/
├── src/
│   ├── components/
│   │   ├── Header.jsx        # 顶部导航 + Token配置
│   │   ├── SearchBar.jsx      # 搜索框（防抖）
│   │   ├── FilterBar.jsx      # 筛选器 + 视图切换
│   │   ├── ProjectCard.jsx    # 项目卡片/表格视图
│   │   ├── ProjectForm.jsx    # 新增/编辑项目表单
│   │   ├── ProposalCard.jsx  # 提案卡片/表格视图（兼容）
│   │   └── ProposalForm.jsx   # 新增/编辑提案表单
│   ├── hooks/
│   │   └── useGitHub.js       # GitHub API 操作
│   ├── App.jsx                # 主应用
│   ├── index.css              # Tailwind 入口
│   └── main.jsx               # React 入口
├── data/
│   └── proposals.json         # 项目+提案数据
├── index.html
├── vite.config.js
└── package.json
```

---

## 配置说明

首次使用需要配置 GitHub Personal Access Token（PAT）：

1. 点击右上角 **⚙️ 配置**
2. 输入 PAT（格式：`ghp_xxx...`）
3. 点击保存

**Token 权限要求**：
- `repo` — 读写仓库文件（操作 `data/proposals.json`）
- Token 仅存储在浏览器 localStorage 中

---

## 本地运行

```bash
npm install
npm run dev
```

---

## 数据迁移说明

v2 版本从「提案」结构升级为「项目→提案」两层结构：

- 每个原有提案转为独立项目（提案信息保留在项目的 proposals 数组中）
- 项目 url 字段对应原提案的最新访问链接
- 原有数据已完整迁移，可通过 GitHub 提交历史回滚
