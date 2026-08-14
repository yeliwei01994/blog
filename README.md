# FORM / FUTURE

叶厉为的个人日记。前端使用 React、Vite 和 TypeScript 构建为静态网站，默认部署地址为：

`https://yeliwei01994.github.io/blog/`

## 技术栈

- React + React Router：页面与客户端路由
- Vite：本地开发与静态构建
- Markdown：日记内容来源
- GitHub Pages：静态网站部署
- Node + PostgreSQL：独立留言板 API（本地开发阶段）

## 本地运行

需要 Node.js `22.12` 或更高版本。

```bash
npm --prefix apps/web ci
npm --prefix apps/web run dev
```

开发地址通常为 `http://localhost:5173/blog/`。

## 常用命令

```bash
# 将 Markdown 日记生成给 React 使用的文章数据
npm --prefix apps/web run generate:content

# 运行全部测试
npm --prefix apps/web test -- --run

# TypeScript 检查
npm --prefix apps/web run check

# 生成 GitHub Pages 静态文件
npm --prefix apps/web run build

# 构建、测试与类型检查
npm --prefix apps/web run verify

# 预览生产构建
npm --prefix apps/web run preview
```

构建结果位于 `apps/web/dist/`。

## 写一篇日记

复制 `apps/web/src/content/diary/_template.md`，重命名后开始写作：

```yaml
---
title: "文章标题"
description: "用于日记列表和文章页简介。"
publishedAt: 2026-08-14
updatedAt: 2026-08-14
draft: false
---
```

- `draft: true` 的日记不会生成到公开文章数据中。
- 保存 Markdown 后，执行 `npm --prefix apps/web run generate:content`，再刷新页面即可看到更新。
- `npm --prefix apps/web run build` 会自动执行内容生成。
- 封面文件可放在 `apps/web/public/images/`，并在 frontmatter 的 `cover` 中填写从站点根开始的路径。

## 修改站点信息与样式

- `apps/web/src/site/site-config.ts`：站点名称、介绍、作者、导航和社交链接。
- `apps/web/src/styles/global.css`：主题色、字体、间距和深浅色变量。
- `apps/web/src/styles/editorial.css`：首页、日记列表和文章阅读排版。
- `apps/web/src/app/pages/`：首页、日记、文章详情、关于页、留言板和 404 页面。

## GitHub Pages 部署

仓库包含 `.github/workflows/deploy.yml`。推送或合并到 `main` 后，GitHub Actions 会安装前端依赖、生成 Markdown 内容、运行 Vite 构建，并发布 `apps/web/dist/`。

首次部署前，在 GitHub 仓库中打开：

1. `Settings → Pages`
2. 将 `Source` 设置为 `GitHub Actions`

生产路径默认为 `/blog/`。如仓库名发生变化，可在构建时设置 `BASE_PATH`；站点根路径配置位于 `apps/web/vite.config.ts`。

## 项目结构

```text
apps/
├─ web/                         React + Vite 静态博客
│  ├─ public/                   图标与 GitHub Pages 404 回退页
│  ├─ scripts/                  Markdown 内容生成脚本
│  ├─ src/
│  │  ├─ app/                   路由、页面与基础布局
│  │  ├─ content/diary/         Markdown 日记源文件
│  │  ├─ features/              日记与留言功能
│  │  ├─ generated/             生成的文章数据
│  │  ├─ site/                  站点配置与通用组件
│  │  └─ styles/                页面样式
│  └─ tests/                    前端测试
└─ guestbook-api/               Node + PostgreSQL 留言 API
```
