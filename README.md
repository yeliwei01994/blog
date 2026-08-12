# FORM / FUTURE

叶厉为的个人日记。默认部署地址为：

`https://yeliwei01994.github.io/blog/`

## 本地运行

需要 Node.js 22.12 或更高版本。

```bash
npm --prefix apps/web install
npm --prefix apps/web run dev
```

开发地址默认是 `http://localhost:4321/blog/`。

## 常用检查

```bash
npm --prefix apps/web test -- --run
npm --prefix apps/web run check
npm --prefix apps/web run build
npm --prefix apps/web run verify
npm --prefix apps/web run preview
```

构建结果位于 `apps/web/dist/`。

## 写一篇日记

复制 `apps/web/src/content/diary/_template.md`，重命名后开始写作：

```yaml
---
title: "文章标题"
description: "至少二十个字符的文章摘要，用于列表、搜索和 SEO。"
publishedAt: 2026-07-10
updatedAt: 2026-07-10
draft: false
---
```

- `draft: true` 的日记不会出现在网站中。
- 封面文件建议放在 `apps/web/public/images/`，并填写从站点根开始的路径。
- 内容字段由 `apps/web/src/content.config.ts` 校验，错误会在检查或构建阶段报告。

## 修改站点信息

编辑 `apps/web/src/site/site-config.ts` 可以修改：

- 站点名称与介绍
- 作者名称
- 主导航
- GitHub 等社交链接

主题色、字体、间距和深浅色变量位于 `apps/web/src/styles/global.css`；页面栅格与文章排版位于 `apps/web/src/styles/editorial.css`。

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy.yml`。合并或推送到 `main` 后，GitHub Actions 会自动构建并发布静态站点。

首次部署前，在 GitHub 仓库中打开：

1. `Settings → Pages`
2. 将 `Source` 设置为 `GitHub Actions`
3. 推送一次 `main` 分支，等待 `Deploy Astro site to GitHub Pages` 工作流完成

如果仓库名或域名发生变化，请修改 `apps/web/astro.config.mjs` 中的 `site` 与 `base`，或者在构建环境中提供 `SITE_URL` 和 `BASE_PATH`。

## 项目结构

```text
apps/
├─ web/                   Astro 静态博客
│  ├─ src/                页面、内容、功能模块与样式
│  ├─ public/             静态资源
│  └─ tests/              前端测试
└─ guestbook-api/         Node + PostgreSQL 留言 API
```

## 留言板 API

留言板是一个独立的本地练习 API，代码位于 `apps/guestbook-api/`，需要 PostgreSQL 与 `apps/guestbook-api/.env` 中的 `DATABASE_URL`：

```bash
npm --prefix apps/guestbook-api run dev
```

它保持独立于 GitHub Pages 静态部署；博客端通过 `PUBLIC_API_BASE_URL` 访问它。本地未设置该变量时，会使用 `http://localhost:3000`。

## 命名约定

- TypeScript 变量、函数和 JSON / HTTP 字段使用 `camelCase`，例如 `apiBaseUrl`、`createdAt`。
- TypeScript 类型与 Astro 组件使用 `PascalCase`，例如 `DiaryCard`、`GuestbookMessage`。
- TypeScript 文件、目录和 CSS 类使用 `kebab-case`；Astro 组件文件保留 `PascalCase.astro`。
- 环境变量使用 `UPPER_SNAKE_CASE`，例如 `DATABASE_URL`、`PUBLIC_API_BASE_URL`。
- PostgreSQL 表、列和 SQL migration 使用 `snake_case`，例如 `guestbook_messages`、`created_at`。

命名服从其所在生态的约定：不强行把数据库、环境变量或 Astro 路由改成驼峰命名。

## 项目文档

- [项目结构](docs/architecture/project-structure.md)：根目录与源码模块职责。
- [设计系统](docs/design-system/master.md)：视觉与版式规则。
- `docs/archive/`：历史设计和实施计划，仅供追溯，不参与运行。
