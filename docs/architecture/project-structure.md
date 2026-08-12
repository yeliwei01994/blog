# 项目结构

## 根目录职责

- `src/`：Astro 博客源码。
- `public/`：直接发布的静态资源。
- `api/`：独立运行的留言板 API。
- `tests/`：前端行为与构建验证。
- `docs/`：架构、设计系统和历史设计记录。
- `.github/`：GitHub Pages 发布工作流。

`dist/`、`.astro/` 和 `node_modules/` 是本地生成内容，不属于项目源码结构。

## 源码职责

```text
src/
├─ content/diary/     日记 Markdown/MDX
├─ features/          diary、home、guestbook 等业务能力
├─ layouts/           页面布局装配
├─ pages/             Astro 文件路由
├─ site/              站点配置、站点壳组件和 URL 工具
└─ styles/            全局设计 token 与排版
```

`pages/`、`layouts/` 和 `content/diary/` 保持 Astro 约定位置。`features/` 只包含具体能力的私有实现；`site/` 只包含全站通用但与站点身份直接相关的代码。
