# FORM / FUTURE

一套使用 Astro 7、TypeScript 和 Markdown/MDX 构建的未来编辑部风个人博客。默认部署地址为：

`https://yeliwei01994.github.io/blog/`

## 本地运行

需要 Node.js 22.12 或更高版本。

```bash
npm install
npm run dev
```

开发地址默认是 `http://localhost:4321/blog/`。

## 常用检查

```bash
npm test -- --run
npm run check
npm run build
npm run preview
```

构建结果位于 `dist/`。

## 发布新文章

在 `src/content/blog/` 新建 `.md` 或 `.mdx` 文件：

```yaml
---
title: "文章标题"
description: "至少二十个字符的文章摘要，用于列表、搜索和 SEO。"
publishedAt: 2026-07-10
updatedAt: 2026-07-10
tags: ["Astro", "写作"]
cover: "/images/cover-name.svg"
featured: false
draft: false
---
```

- `draft: true` 的文章不会进入生产列表、归档、标签和搜索。
- 封面文件建议放在 `public/images/`，并填写从站点根开始的路径。
- 内容字段由 `src/content.config.ts` 校验，错误会在检查或构建阶段报告。

## 修改站点信息

编辑 `src/config/site.ts` 可以修改：

- 站点名称与介绍
- 作者名称
- 主导航
- GitHub 等社交链接

主题色、字体、间距和深浅色变量位于 `src/styles/global.css`；页面栅格与文章排版位于 `src/styles/editorial.css`。

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy.yml`。合并或推送到 `main` 后，GitHub Actions 会自动构建并发布静态站点。

首次部署前，在 GitHub 仓库中打开：

1. `Settings → Pages`
2. 将 `Source` 设置为 `GitHub Actions`
3. 推送一次 `main` 分支，等待 `Deploy Astro site to GitHub Pages` 工作流完成

如果仓库名或域名发生变化，请修改 `astro.config.mjs` 中的 `site` 与 `base`，或者在构建环境中提供 `SITE_URL` 和 `BASE_PATH`。

## 项目结构

```text
src/
├─ components/       可复用界面组件
├─ config/site.ts    站点身份与导航
├─ content/blog/     Markdown/MDX 文章
├─ layouts/          基础页面与文章布局
├─ lib/              内容查询与 URL 工具
├─ pages/            Astro 路由
├─ scripts/          搜索等渐进增强逻辑
└─ styles/           设计 Token 与编辑部版式
```
