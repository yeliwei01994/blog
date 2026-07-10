# Astro Editorial Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished future-editorial personal blog in `D:\astro-blog` that publishes Markdown/MDX content as a static GitHub Pages site.

**Architecture:** Astro statically generates pages from a typed `blog` content collection. Focused content helpers supply sorted posts, tags, archives, adjacent-post navigation, and a build-time JSON search index; shared layouts and components render a magazine-style interface with a small amount of progressive client-side behavior.

**Tech Stack:** Astro, TypeScript, MDX, Vitest, native CSS, GitHub Actions, GitHub Pages

## Global Constraints

- Source repository: `https://github.com/yeliwei01994/blog.git`; local path: `D:\astro-blog`.
- Static output only; production output is `dist/`.
- Content is authored in Markdown/MDX and validated by Astro Content Collections.
- No React/Vue/Svelte runtime and no general-purpose UI framework.
- Light and dark modes, keyboard focus, `prefers-reduced-motion`, 375px mobile layout, and WCAG AA text contrast are required.
- Draft posts are excluded from production listings, tags, archives, search, and sitemap-like navigation.
- The first release includes no database, login, admin panel, comments, analytics, or third-party image host.

---

## File Map

- `astro.config.mjs`: static-site, MDX, and GitHub Pages build configuration.
- `src/content.config.ts`: typed `blog` collection schema.
- `src/config/site.ts`: editable site identity, navigation, and social links.
- `src/lib/posts.ts`: all post querying, sorting, tagging, grouping, and adjacency logic.
- `src/layouts/BaseLayout.astro`: document shell, SEO metadata, theme bootstrap, header, and footer.
- `src/layouts/PostLayout.astro`: article shell, progress bar, TOC, and adjacent navigation.
- `src/components/*.astro`: focused visual and interactive units.
- `src/pages/**`: route composition only; content logic stays in `src/lib/posts.ts`.
- `src/styles/global.css`: semantic tokens, reset, typography, shared layout, and accessibility rules.
- `src/styles/editorial.css`: magazine grids, cards, article presentation, and motion.
- `src/content/blog/*`: three Chinese example posts.
- `tests/posts.test.ts`: deterministic content-helper tests.
- `tests/build.test.ts`: build-output smoke checks.
- `.github/workflows/deploy.yml`: official Astro/GitHub Pages deployment flow.

### Task 1: Clone and establish a tested Astro foundation

**Files:**
- Create from Astro scaffold: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`
- Create: `vitest.config.ts`, `tests/foundation.test.ts`
- Preserve: `README.md`

**Interfaces:**
- Produces npm scripts `dev`, `build`, `preview`, `check`, and `test` used by every later task.
- Produces the `@/*` TypeScript alias for imports from `src/`.

- [ ] **Step 1: Clone the repository and confirm its initial state**

```powershell
git clone https://github.com/yeliwei01994/blog.git D:\astro-blog
git -C D:\astro-blog status --short --branch
```

Expected: branch `main`, clean tree, and only the existing `README.md` tracked.

- [ ] **Step 2: Scaffold Astro into the existing clone and install test tooling**

```powershell
npm create astro@latest D:\astro-blog -- --template minimal --install --no-git --yes
Set-Location D:\astro-blog
npm install @astrojs/mdx
npm install -D vitest @vitest/coverage-v8
```

Expected: Astro dependencies install successfully without replacing `.git`.

- [ ] **Step 3: Write a failing foundation test**

```ts
// tests/foundation.test.ts
import { describe, expect, it } from 'vitest';
import { SITE } from '../src/config/site';

describe('site configuration', () => {
  it('defines a usable editorial identity', () => {
    expect(SITE.title.length).toBeGreaterThan(0);
    expect(SITE.description.length).toBeGreaterThan(20);
    expect(SITE.nav.map((item) => item.href)).toContain('/posts/');
  });
});
```

- [ ] **Step 4: Run the test and verify the missing module failure**

```powershell
npm test -- --run tests/foundation.test.ts
```

Expected: FAIL because `src/config/site.ts` does not exist.

- [ ] **Step 5: Add project configuration and the minimal site identity**

```ts
// src/config/site.ts
export const SITE = {
  title: 'FORM / FUTURE',
  description: '记录代码、设计与日常观察的未来编辑部式个人博客。',
  author: 'Yeliwei',
  locale: 'zh-CN',
  nav: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/posts/' },
    { label: '归档', href: '/archive/' },
    { label: '标签', href: '/tags/' },
    { label: '关于', href: '/about/' },
  ],
  social: [{ label: 'GitHub', href: 'https://github.com/yeliwei01994' }],
} as const;
```

Configure `astro.config.mjs` with `output: 'static'`, the MDX integration, and an environment-overridable `site`. Add `check` as `astro check` and `test` as `vitest` in `package.json`. Configure Vitest for Node and coverage of `src/lib/**/*.ts`.

- [ ] **Step 6: Run the foundation checks**

```powershell
npm test -- --run tests/foundation.test.ts
npm run build
```

Expected: one passing test and a successful static build.

- [ ] **Step 7: Commit the foundation**

```powershell
git add .
git commit -m "chore: establish Astro blog foundation"
```

### Task 2: Add typed content and test-driven post queries

**Files:**
- Create: `src/content.config.ts`, `src/lib/posts.ts`
- Create: `src/content/blog/starting-a-digital-garden.md`
- Create: `src/content/blog/astro-content-workflow.mdx`
- Create: `src/content/blog/designing-with-constraints.md`
- Create: `tests/posts.test.ts`

**Interfaces:**
- Produces `getPublishedPosts()`, `getAllTags()`, `groupPostsByYear()`, and `getAdjacentPosts(posts, slug)`.
- All pages consume the returned Astro `CollectionEntry<'blog'>` values without querying the collection directly.

- [ ] **Step 1: Write failing post-helper tests**

```ts
// tests/posts.test.ts
import { describe, expect, it } from 'vitest';
import { getAdjacentPosts, groupPostsByYear, sortAndFilterPosts } from '../src/lib/posts';

const post = (id: string, date: string, draft = false) => ({
  id,
  data: { title: id, description: id, publishedAt: new Date(date), tags: ['Astro'], draft },
});

describe('post helpers', () => {
  it('removes drafts and sorts newest first', () => {
    const result = sortAndFilterPosts([
      post('old', '2025-01-01'), post('draft', '2027-01-01', true), post('new', '2026-01-01'),
    ] as never);
    expect(result.map((item) => item.id)).toEqual(['new', 'old']);
  });

  it('groups posts by year and finds adjacent entries', () => {
    const posts = sortAndFilterPosts([post('b', '2026-02-01'), post('a', '2025-01-01')] as never);
    expect([...groupPostsByYear(posts).keys()]).toEqual([2026, 2025]);
    expect(getAdjacentPosts(posts, 'b').next?.id).toBe('a');
  });
});
```

- [ ] **Step 2: Verify tests fail because helpers are absent**

```powershell
npm test -- --run tests/posts.test.ts
```

Expected: FAIL with unresolved `src/lib/posts` exports.

- [ ] **Step 3: Implement the collection schema and helpers**

Define the collection with `glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' })` and a Zod schema containing `title`, `description`, `publishedAt`, optional `updatedAt`, defaulted `tags`, optional `cover`, defaulted `featured`, and defaulted `draft`. Implement pure `sortAndFilterPosts`, `groupPostsByYear`, and `getAdjacentPosts`; wrap `getCollection('blog')` only inside `getPublishedPosts()`.

- [ ] **Step 4: Add three complete Chinese sample posts**

Each file must contain valid frontmatter and collectively demonstrate headings, links, a table, a quote, a TypeScript code fence, an image with alt text, and multiple tags. Use local SVG/gradient artwork from `public/images/`, never a remote placeholder URL.

- [ ] **Step 5: Run focused tests and collection validation**

```powershell
npm test -- --run tests/posts.test.ts
npx astro check
```

Expected: all helper tests pass and Astro reports zero errors.

- [ ] **Step 6: Commit typed content**

```powershell
git add src/content.config.ts src/lib src/content tests/posts.test.ts public/images
git commit -m "feat: add typed editorial content collection"
```

### Task 3: Build the editorial design system and shared shell

**Files:**
- Create: `src/styles/global.css`, `src/styles/editorial.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/ThemeToggle.astro`
- Create: `tests/design.test.ts`

**Interfaces:**
- `BaseLayout` accepts `title`, `description`, optional `image`, and optional `article`.
- All pages render inside `BaseLayout`; the shell owns metadata, skip link, theme bootstrap, header, main landmark, and footer.

- [ ] **Step 1: Write failing design-contract tests**

```ts
// tests/design.test.ts
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('design system', () => {
  const css = fs.readFileSync('src/styles/global.css', 'utf8');
  it('defines semantic tokens and accessibility fallbacks', () => {
    expect(css).toContain('--color-accent:');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
  });
});
```

- [ ] **Step 2: Verify the missing stylesheet failure**

```powershell
npm test -- --run tests/design.test.ts
```

Expected: FAIL with `ENOENT` for `src/styles/global.css`.

- [ ] **Step 3: Implement tokens and the shared page shell**

Use paper-white, ink-black, muted gray, and electric-orange semantic tokens; a 4/8px spacing rhythm; fluid `clamp()` typography; a 12-column max-width grid; visible 3px focus rings; and a reduced-motion block that removes nonessential transitions. Add an inline theme bootstrap in `<head>` so stored/system theme is applied before paint.

- [ ] **Step 4: Implement responsive header, footer, and theme control**

Use semantic `<header>`, `<nav>`, `<button>`, and `<footer>` elements. Ensure the theme button has a 44×44px hit area and text accessible name, and the mobile navigation wraps without horizontal overflow.

- [ ] **Step 5: Verify the design contract and static build**

```powershell
npm test -- --run tests/design.test.ts
npm run build
```

Expected: tests pass and the shared shell builds without hydration errors.

- [ ] **Step 6: Commit the design system**

```powershell
git add src/styles src/layouts src/components tests/design.test.ts
git commit -m "feat: create future editorial design system"
```

### Task 4: Compose all static routes and editorial cards

**Files:**
- Create: `src/components/HeroFeature.astro`, `src/components/PostCard.astro`, `src/components/TagChip.astro`, `src/components/ArticleMeta.astro`
- Create/Modify: `src/pages/index.astro`, `src/pages/posts/index.astro`
- Create: `src/pages/archive/index.astro`, `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`, `src/pages/about.astro`, `src/pages/404.astro`
- Create: `tests/routes.test.ts`

**Interfaces:**
- `PostCard` consumes `{ post, index, size?: 'feature' | 'standard' | 'compact' }`.
- Tag pages receive URL-encoded tag params and use the same normalized comparison as `getAllTags()`.

- [ ] **Step 1: Write a failing route inventory test**

```ts
// tests/routes.test.ts
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('route inventory', () => {
  for (const route of ['index.astro', 'posts/index.astro', 'archive/index.astro', 'tags/index.astro', 'about.astro', '404.astro']) {
    it(`contains ${route}`, () => expect(fs.existsSync(`src/pages/${route}`)).toBe(true));
  }
});
```

- [ ] **Step 2: Run the test and observe missing routes**

```powershell
npm test -- --run tests/routes.test.ts
```

Expected: FAIL for archive, tags, about, and 404 routes.

- [ ] **Step 3: Build home and post-list compositions**

Home uses a cover-like Hero, one feature card, an asymmetric recent-post grid, tag index, and author strip. `/posts/` renders every published post and exposes tag links without duplicating query logic.

- [ ] **Step 4: Build archive, tag, about, and 404 routes**

Archive uses year-grouped editorial numbering. Tag index shows counts; `[tag].astro` uses `getStaticPaths()`. About contains editable Chinese biography and technology sections. The 404 page provides links back to home and posts.

- [ ] **Step 5: Run route and build verification**

```powershell
npm test -- --run tests/routes.test.ts
npm run build
```

Expected: all inventory tests pass and `dist/` includes every static route plus one page per sample tag.

- [ ] **Step 6: Commit the route set**

```powershell
git add src/components src/pages tests/routes.test.ts
git commit -m "feat: compose editorial blog routes"
```

### Task 5: Add article reading and lightweight search interactions

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Create: `src/components/TableOfContents.astro`, `src/components/ReadingProgress.astro`, `src/components/CodeCopyButton.astro`, `src/components/SearchDialog.astro`
- Create: `src/pages/posts/[...id].astro`, `src/pages/search-index.json.ts`
- Create: `src/scripts/theme.ts`, `src/scripts/search.ts`, `src/scripts/reading.ts`
- Create: `tests/search.test.ts`

**Interfaces:**
- `/search-index.json` returns `{ title, description, href, tags }[]` for published posts only.
- `SearchDialog` fetches that endpoint only when first opened and filters normalized title, description, and tag text.

- [ ] **Step 1: Write a failing search-normalization test**

```ts
// tests/search.test.ts
import { describe, expect, it } from 'vitest';
import { normalizeSearchText } from '../src/scripts/search';

describe('search normalization', () => {
  it('normalizes case and surrounding whitespace', () => {
    expect(normalizeSearchText('  Astro 内容  ')).toBe('astro 内容');
  });
});
```

- [ ] **Step 2: Confirm the search helper is missing**

```powershell
npm test -- --run tests/search.test.ts
```

Expected: FAIL because `src/scripts/search.ts` is absent.

- [ ] **Step 3: Implement search, dialog keyboard behavior, and JSON endpoint**

Export the pure normalizer before attaching browser listeners. The dialog must open from the header, focus its input, close on Escape or its close button, restore focus to the trigger, expose an explicit empty state, and never trap the user without an exit.

- [ ] **Step 4: Implement generated article routes and reading aids**

Use `getStaticPaths()` over published posts, `render(post)` for `Content` and headings, and `getAdjacentPosts()` for navigation. Reading progress updates via `requestAnimationFrame`; code-copy buttons are progressively attached to code blocks and announce success through visible text.

- [ ] **Step 5: Verify unit behavior and production output**

```powershell
npm test -- --run tests/search.test.ts
npx astro check
npm run build
```

Expected: passing tests, zero Astro errors, article HTML files, and `dist/search-index.json` containing exactly three published entries.

- [ ] **Step 6: Commit reading and search features**

```powershell
git add src/layouts src/components src/pages src/scripts tests/search.test.ts
git commit -m "feat: add article reading and search experience"
```

### Task 6: Add deployment, documentation, and final smoke verification

**Files:**
- Create: `.github/workflows/deploy.yml`
- Replace: `README.md`
- Create: `tests/build.test.ts`
- Copy: `docs/superpowers/specs/2026-07-10-astro-editorial-blog-design.md`
- Copy: `docs/superpowers/plans/2026-07-10-astro-editorial-blog.md`

**Interfaces:**
- GitHub Actions builds with Node 22, uploads `dist/`, and deploys through the official Pages actions.
- README defines the exact local writing, checking, building, and deployment workflow.

- [ ] **Step 1: Write a failing build-output smoke test**

```ts
// tests/build.test.ts
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('production build', () => {
  for (const file of ['dist/index.html', 'dist/posts/index.html', 'dist/archive/index.html', 'dist/tags/index.html', 'dist/about/index.html', 'dist/404.html', 'dist/search-index.json']) {
    it(`emits ${file}`, () => expect(fs.existsSync(file)).toBe(true));
  }
});
```

- [ ] **Step 2: Verify the test fails before a fresh build**

```powershell
Remove-Item -Recurse -Force D:\astro-blog\dist -ErrorAction SilentlyContinue
npm test -- --run tests/build.test.ts
```

Expected: FAIL because `dist/` is absent.

- [ ] **Step 3: Add GitHub Pages workflow and complete README**

The workflow must use `actions/checkout@v4`, `withastro/action@v3`, and `actions/deploy-pages@v4`, request `contents: read`, `pages: write`, and `id-token: write`, and target the `github-pages` environment. README must document `npm install`, `npm run dev`, `npm test -- --run`, `npm run check`, `npm run build`, content frontmatter, site configuration, and enabling Pages with GitHub Actions as the source.

- [ ] **Step 4: Run the complete verification sequence**

```powershell
npm test -- --run
npm run check
npm run build
npm test -- --run tests/build.test.ts
git status --short
```

Expected: all tests pass, Astro reports zero errors, build succeeds, smoke tests pass, and only planned documentation/workflow changes remain unstaged.

- [ ] **Step 5: Inspect responsive and accessible output**

Run the production preview, inspect homepage and an article at 375×812 and 1440×900, test keyboard-only navigation, Escape behavior in search, light/dark themes, and reduced motion. Confirm no horizontal page scroll and no browser-console errors.

- [ ] **Step 6: Commit the finished skeleton**

```powershell
git add .github README.md docs tests/build.test.ts
git commit -m "docs: add deployment and authoring workflow"
git status --short --branch
```

Expected: clean `main` branch with local commits ready for review; do not push until explicitly requested.
