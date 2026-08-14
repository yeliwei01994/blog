# React Static Blog Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Astro frontend with a Vite React static blog that preserves the existing URLs, content, presentation, guestbook behavior, and GitHub Pages deployment.

**Architecture:** A Node build script converts the existing Markdown diary files into a typed generated data module that React uses at runtime. React Router owns the public routes while Vite produces static files under `/blog/`; a generated 404 recovery page restores direct deep links on GitHub Pages.

**Tech Stack:** Vite, React, TypeScript, React Router, gray-matter, marked, Vitest, Testing Library, GitHub Actions, GitHub Pages.

## Global Constraints

- Node.js remains `>=22.12.0`.
- Production deployment is static GitHub Pages output with base path exactly `/blog`.
- Preserve existing public routes `/`, `/diary`, `/diary/:id`, `/about`, `/guestbook`, and the 404 page.
- Preserve all Markdown diary source files, article identifiers, existing CSS presentation, and guestbook API behavior.
- Do not modify `apps/guestbook-api` or its database schema.
- Add or update a test before each production behavior change; confirm it fails before implementing the change.

---

## File Structure

- `apps/web/package.json`: Vite/React scripts, dependencies, and test environment.
- `apps/web/vite.config.ts`: GitHub Pages base path, React plugin, static 404 generation hook, and Vitest configuration.
- `apps/web/scripts/generate-diary-content.ts`: build-time Markdown discovery, validation, HTML rendering, heading extraction, and generated-module output.
- `apps/web/src/generated/diary.ts`: generated, typed article data consumed by the application; excluded from hand editing.
- `apps/web/src/app/*`: application router, HTML metadata manager, layouts, pages, and GitHub Pages deep-link restoration.
- `apps/web/src/features/*`: React versions of home, diary, and guestbook features.
- `apps/web/src/site/*`: reusable site configuration, base URL helpers, header, footer, and theme switcher.
- `apps/web/src/styles/*`: existing styles retained with only framework-required adjustments.
- `apps/web/tests/*`: behavior-level migration tests plus converted existing tests.
- `apps/web/public/404.html`: GitHub Pages recovery document emitted from a source template.
- `.github/workflows/deploy.yml`: generic Node/Vite build-and-upload workflow.

### Task 1: Establish the Vite React static application shell

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/app/App.tsx`
- Create: `apps/web/src/app/pages/NotFoundPage.tsx`
- Create: `apps/web/src/app/styles.ts`
- Modify: `apps/web/tests/build.test.ts`

**Interfaces:**
- Produces: `App`, the application root rendered by `src/main.tsx`.
- Produces: `withBase(path: string, base?: string): string`, retained in `src/site/site-url.ts` for all internal links.
- Produces: `npm run build`, `npm run check`, and `npm test` commands for later tasks. Task 2 adds `npm run generate:content` and makes the build command invoke it first.

- [ ] **Step 1: Write the failing Vite build-output test**

Replace the Astro-specific test with a test that asserts `dist/index.html` and `dist/404.html` exist after `npm run build`, and that the index document mounts `#root` and references `/blog/` assets.

```ts
it('emits a GitHub Pages application shell', () => {
  const index = fs.readFileSync('dist/index.html', 'utf8');
  expect(fs.existsSync('dist/404.html')).toBe(true);
  expect(index).toContain('id="root"');
  expect(index).toContain('/blog/assets/');
});
```

- [ ] **Step 2: Run the build test to verify it fails**

Run: `npm test -- --run tests/build.test.ts`

Expected: FAIL because the existing Astro build does not provide the Vite root mount and assets.

- [ ] **Step 3: Install and configure Vite React**

Replace `astro`, `@astrojs/*`, and MDX dependencies with `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `react-router-dom`, and compatible type/testing dependencies. Define scripts so `build` runs `vite build`, `dev` starts Vite, and `check` runs `tsc --noEmit`.

```ts
export default defineConfig({
  base: process.env.BASE_PATH ?? '/blog/',
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'] },
});
```

Add the minimal `index.html`, `main.tsx`, and `App.tsx` that render a React `NotFoundPage` inside `#root`. Import the existing global and editorial styles from `main.tsx`. Keep `withBase` unchanged.

- [ ] **Step 4: Add GitHub Pages static fallback generation**

Configure Vite to copy a `public/404.html` recovery template that stores the requested path in `sessionStorage` and redirects to `/blog/`. Add `restoreGitHubPagesPath()` in `src/app/restore-path.ts`; before creating the router it reads and removes that value, normalizes it against the configured base, and returns the intended route.

- [ ] **Step 5: Run the build test to verify it passes**

Run: `npm run build; npm test -- --run tests/build.test.ts`

Expected: PASS; `dist/index.html` and `dist/404.html` exist and the Vite root document references base-prefixed assets.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/package.json apps/web/vite.config.ts apps/web/tsconfig.json apps/web/index.html apps/web/public/404.html apps/web/src/main.tsx apps/web/src/app apps/web/tests/build.test.ts
git commit -m "feat: establish Vite React blog shell"
```

### Task 2: Generate and test typed diary content from Markdown

**Files:**
- Create: `apps/web/scripts/generate-diary-content.ts`
- Create: `apps/web/src/features/diary/diary-types.ts`
- Create: `apps/web/src/generated/.gitkeep`
- Modify: `apps/web/src/features/diary/diary-utils.ts`
- Create: `apps/web/tests/generate-diary-content.test.ts`
- Modify: `apps/web/tests/diary.test.ts`

**Interfaces:**
- Produces: `DiaryArticle` with `id`, `title`, `description`, `publishedAt`, optional `updatedAt`, optional `cover`, `draft`, `html`, and `headings` fields.
- Produces: `generateDiaryContent({ sourceDirectory, outputFile }): Promise<void>`.
- Produces: `sortAndFilterEntries(entries)` and `getAdjacentEntries(entries, id)` operating on `DiaryArticle` data.

- [ ] **Step 1: Write failing generator tests**

Use a temporary fixture directory containing one published Markdown article, one draft, and one article with malformed frontmatter. Assert the generator writes a module with the published article's filename-derived ID, rendered heading HTML, ordered `h2`/`h3` heading metadata, and excludes drafts from the public array. Assert malformed frontmatter rejects with the filename.

```ts
await generateDiaryContent({ sourceDirectory: fixture, outputFile });
const generated = await import(pathToFileURL(outputFile).href);
expect(generated.diaryArticles[0]).toMatchObject({ id: '2026-08-14', title: 'Published' });
expect(generated.diaryArticles[0].headings).toEqual([{ depth: 2, slug: 'section', text: 'Section' }]);
```

- [ ] **Step 2: Run the generator tests to verify they fail**

Run: `npm test -- --run tests/generate-diary-content.test.ts`

Expected: FAIL because `generateDiaryContent` does not exist.

- [ ] **Step 3: Implement content generation**

Read `src/content/diary/*.md`, ignore `_template.md`, parse frontmatter with `gray-matter`, validate the fields currently defined in `content.config.ts`, render Markdown with `marked`, and extract stable IDs from headings. Write a deterministic TypeScript module exporting `diaryArticles`. Use the existing newest-first sort and draft filter semantics. Do not mutate source Markdown files. Add `tsx` and the `generate:content` script, then update `build` to run `npm run generate:content && vite build`.

- [ ] **Step 4: Convert diary utility tests and implementation types**

Replace Astro `CollectionEntry` types with `DiaryArticle`/`DiarySummary` types. Keep the current regression cases for draft removal, newest-first sorting, and adjacent navigation; update imports to React-independent diary modules.

- [ ] **Step 5: Run content tests to verify they pass**

Run: `npm run generate:content; npm test -- --run tests/generate-diary-content.test.ts tests/diary.test.ts`

Expected: PASS; the generated module contains every published diary entry and all current diary helper tests remain green.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/scripts apps/web/src/features/diary apps/web/src/generated apps/web/tests/generate-diary-content.test.ts apps/web/tests/diary.test.ts
git commit -m "feat: generate React diary content from Markdown"
```

### Task 3: Build shared React layout, metadata, and static routes

**Files:**
- Create: `apps/web/src/app/components/BaseLayout.tsx`
- Create: `apps/web/src/app/components/DocumentMeta.tsx`
- Create: `apps/web/src/app/pages/HomePage.tsx`
- Create: `apps/web/src/app/pages/DiaryIndexPage.tsx`
- Create: `apps/web/src/app/pages/AboutPage.tsx`
- Create: `apps/web/src/site/components/SiteHeader.tsx`
- Create: `apps/web/src/site/components/SiteFooter.tsx`
- Create: `apps/web/src/site/components/ThemeToggle.tsx`
- Modify: `apps/web/src/app/App.tsx`
- Modify: `apps/web/tests/routes.test.ts`
- Create: `apps/web/tests/app-routes.test.tsx`

**Interfaces:**
- Consumes: `SITE` and `withBase` from the existing site modules, plus `diaryArticles` from Task 2.
- Produces: `BaseLayout({ title, description, image, article, children })` used by all pages.
- Produces: React Router route elements for `/`, `/diary`, `/about`, `/guestbook`, `/diary/:id`, and `*`.

- [ ] **Step 1: Write failing static-route rendering tests**

Render `App` with `MemoryRouter` at `/`, `/diary`, and `/about`. Assert the shell contains exactly one `main`, the configured navigation links include the `/blog/` base path, and each route preserves the existing visible headings/copy.

```tsx
render(<App initialPath="/about" />);
expect(screen.getByRole('main')).toHaveTextContent('你好，我是叶厉为');
expect(document.querySelectorAll('main')).toHaveLength(1);
```

- [ ] **Step 2: Run route tests to verify they fail**

Run: `npm test -- --run tests/app-routes.test.tsx tests/routes.test.ts`

Expected: FAIL because the React page and route modules do not exist.

- [ ] **Step 3: Implement the common layout and routes**

Port the structural markup from `BaseLayout.astro`, `SiteHeader.astro`, `SiteFooter.astro`, `ThemeToggle.astro`, `index.astro`, `diary/index.astro`, and `about.astro` into focused React components. Use `Link` only for same-site navigation, `withBase` for all generated hrefs, and `useEffect` for theme persistence. Implement `DocumentMeta` with title, description, canonical URL, Open Graph fields, and the existing icon path.

- [ ] **Step 4: Convert structural route inventory tests**

Replace assertions for Astro source filenames with assertions for route registrations and actual route rendering. Retain the regression that removed legacy post/archive/tag/search routes do not become public routes.

- [ ] **Step 5: Run route tests to verify they pass**

Run: `npm test -- --run tests/app-routes.test.tsx tests/routes.test.ts tests/foundation.test.ts tests/urls.test.ts`

Expected: PASS; all static routes render, the base-path helper remains correct, and the document contains one `main` landmark.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/app apps/web/src/site apps/web/tests/app-routes.test.tsx apps/web/tests/routes.test.ts apps/web/tests/foundation.test.ts apps/web/tests/urls.test.ts
git commit -m "feat: add React blog routes and shared layout"
```

### Task 4: Port the diary reading experience and article routes

**Files:**
- Create: `apps/web/src/app/pages/DiaryArticlePage.tsx`
- Create: `apps/web/src/features/diary/components/ArticleMeta.tsx`
- Create: `apps/web/src/features/diary/components/DiaryCard.tsx`
- Create: `apps/web/src/features/diary/components/TableOfContents.tsx`
- Create: `apps/web/src/features/diary/components/ReadingProgress.tsx`
- Create: `apps/web/src/features/diary/components/CodeCopyButton.tsx`
- Modify: `apps/web/src/app/App.tsx`
- Modify: `apps/web/tests/design.test.ts`
- Create: `apps/web/tests/diary-article.test.tsx`

**Interfaces:**
- Consumes: `DiaryArticle`, `diaryArticles`, `getAdjacentEntries`, `BaseLayout`, and `withBase`.
- Produces: `DiaryArticlePage`, which renders one article based on `useParams().id` or the `NotFoundPage`.

- [ ] **Step 1: Write failing article-route and interaction tests**

Render a known generated article route and assert its title, article header, table-of-contents links, one occurrence of its rendered text, and adjacent links. Add tests that clicking Copy calls `navigator.clipboard.writeText` with the source code and updates the live status. Add a scroll test that updates the reading-progress transform.

```tsx
render(<App initialPath="/diary/2026-08-09-compute-research-and-go" />);
expect(screen.getByRole('article')).toHaveTextContent('8/3-8/9 工作与学习记录');
expect(screen.getByRole('navigation', { name: '文章目录' })).toBeInTheDocument();
```

- [ ] **Step 2: Run diary article tests to verify they fail**

Run: `npm test -- --run tests/diary-article.test.tsx`

Expected: FAIL because React diary components and the parameterized article route do not exist.

- [ ] **Step 3: Implement React diary components**

Port the Astro diary card, metadata, table of contents, reading-progress, and article layout markup. Render generated article HTML through a single reviewed `dangerouslySetInnerHTML` boundary sourced only from the build-time Markdown compiler. In `CodeCopyButton`, enhance rendered `pre > code` blocks on mount, preserve the existing `code-window` class structure and PLAINTEXT fallback, and report clipboard errors accessibly. Use an effect with cleanup for scroll listeners.

- [ ] **Step 4: Preserve visual regression assertions**

Update `design.test.ts` to inspect the React component output/build output rather than `.astro` files. Retain assertions for editorial CSS class names, the reading grid, code-window structure, home hero copy, visible guestbook labels, and exactly one article body instance.

- [ ] **Step 5: Run diary tests to verify they pass**

Run: `npm run generate:content; npm test -- --run tests/diary-article.test.tsx tests/design.test.ts tests/diary.test.ts`

Expected: PASS; article rendering, code copying, reading progress, article navigation, and visual class regressions are covered.

- [ ] **Step 6: Commit**

```powershell
git add apps/web/src/app/pages/DiaryArticlePage.tsx apps/web/src/features/diary/components apps/web/src/app/App.tsx apps/web/tests/diary-article.test.tsx apps/web/tests/design.test.ts
git commit -m "feat: port diary reading experience to React"
```

### Task 5: Port guestbook behavior and production deployment

**Files:**
- Create: `apps/web/src/app/pages/GuestbookPage.tsx`
- Create: `apps/web/src/features/guestbook/Guestbook.tsx`
- Modify: `apps/web/src/features/guestbook/guestbook-client.ts`
- Modify: `apps/web/src/features/guestbook/guestbook.css`
- Modify: `apps/web/src/app/App.tsx`
- Modify: `apps/web/tests/guestbook-client.test.ts`
- Create: `apps/web/tests/guestbook.test.tsx`
- Modify: `.github/workflows/deploy.yml`
- Delete: `apps/web/astro.config.mjs`
- Delete: `apps/web/src/content.config.ts`
- Delete: `apps/web/src/features/diary/components/ArticleMeta.astro`
- Delete: `apps/web/src/features/diary/components/CodeCopyButton.astro`
- Delete: `apps/web/src/features/diary/components/DiaryCard.astro`
- Delete: `apps/web/src/features/diary/components/ReadingProgress.astro`
- Delete: `apps/web/src/features/diary/components/TableOfContents.astro`
- Delete: `apps/web/src/features/guestbook/Guestbook.astro`
- Delete: `apps/web/src/features/home/HeroFeature.astro`
- Delete: `apps/web/src/layouts/BaseLayout.astro`
- Delete: `apps/web/src/layouts/DiaryLayout.astro`
- Delete: `apps/web/src/pages/404.astro`
- Delete: `apps/web/src/pages/about.astro`
- Delete: `apps/web/src/pages/diary/[...id].astro`
- Delete: `apps/web/src/pages/diary/index.astro`
- Delete: `apps/web/src/pages/guestbook.astro`
- Delete: `apps/web/src/pages/index.astro`
- Delete: `apps/web/src/site/components/SiteFooter.astro`
- Delete: `apps/web/src/site/components/SiteHeader.astro`
- Delete: `apps/web/src/site/components/ThemeToggle.astro`
- Modify: `apps/web/tests/build.test.ts`

**Interfaces:**
- Consumes: `createMessagesUrl(apiBaseUrl: string): string` and a typed guestbook API client.
- Produces: `GuestbookPage` and `Guestbook({ apiBaseUrl })`, added to `/guestbook`.
- Produces: GitHub Actions Vite deployment from `apps/web/dist`.

- [ ] **Step 1: Write failing guestbook component tests**

Mock only `fetch`, then verify the React guestbook loads messages, submits non-empty name/message fields to the existing `/api/messages` endpoint, disables submission while pending, announces success, and reports an HTTP failure without clearing the text area.

```tsx
render(<Guestbook apiBaseUrl="https://api.example.com" />);
await userEvent.type(screen.getByLabelText('你的名字'), '叶厉为');
await userEvent.click(screen.getByRole('button', { name: '提交留言' }));
expect(await screen.findByRole('status')).toHaveTextContent('留言已提交');
```

- [ ] **Step 2: Run guestbook tests to verify they fail**

Run: `npm test -- --run tests/guestbook.test.tsx tests/guestbook-client.test.ts`

Expected: FAIL because the React guestbook component is not yet implemented.

- [ ] **Step 3: Implement the guestbook React feature**

Extract request functions from the DOM-oriented client into typed `listMessages` and `createMessage` functions while retaining `createMessagesUrl`. Implement controlled name/message fields and exact loading/error/success states in `Guestbook.tsx`. Read `VITE_GUESTBOOK_API_BASE_URL` with `http://localhost:3000` only as the development fallback. Import the existing guestbook CSS and preserve labels and `aria-live` semantics.

- [ ] **Step 4: Switch the deploy workflow and remove Astro-only source**

Replace `withastro/action@v3` with Node setup, `npm ci`, `npm run build`, `actions/upload-pages-artifact@v3` pointing at `apps/web/dist`, and the existing deploy job. Delete Astro configuration, content collection configuration, and `.astro` files only after their React replacements compile. Keep Markdown, CSS, API code, tests, and public icons.

- [ ] **Step 5: Run focused and production verification**

Run: `npm test -- --run tests/guestbook.test.tsx tests/guestbook-client.test.ts; npm run check; npm run build; npm test -- --run`

Expected: PASS; guestbook behavior is preserved, TypeScript is clean, all tests pass, and `dist` contains `/blog`-compatible static files including the 404 recovery document.

- [ ] **Step 6: Commit**

```powershell
git add apps/web .github/workflows/deploy.yml
git add -u apps/web
git commit -m "feat: complete React static blog migration"
```

### Task 6: Document and verify the published static-site contract

**Files:**
- Modify: `apps/web/tests/build.test.ts`
- Modify: `apps/web/tests/design.test.ts`
- Modify: `apps/web/README.md` if it exists; otherwise create `apps/web/README.md`

**Interfaces:**
- Consumes: final Vite build output and all route components.
- Produces: reproducible commands and regression tests for local preview and GitHub Pages deployment.

- [ ] **Step 1: Expand the final artifact assertions**

Update the build test to assert the production output has a `404.html` recovery document containing the configured `/blog/` redirect and inspect every JavaScript asset in `dist/assets` to confirm it contains no `astro` runtime identifier. Add a regression assertion that the generated diary bundle includes the known `2026-08-09-compute-research-and-go` identifier.

- [ ] **Step 2: Document the React workflow**

Create `apps/web/README.md` documenting local development, content generation, tests, production build, preview under `/blog/`, required `VITE_GUESTBOOK_API_BASE_URL`, and GitHub Pages deployment.

- [ ] **Step 3: Run complete verification**

Run: `npm run verify; npm run preview -- --host 127.0.0.1`

Expected: `verify` exits 0. In a browser or HTTP smoke check, `/blog/`, `/blog/diary/`, `/blog/about/`, `/blog/guestbook/`, and a direct diary URL render the expected pages; an unknown URL renders/recoveries to the React 404 view.

- [ ] **Step 4: Commit**

```powershell
git add apps/web/tests/build.test.ts apps/web/tests/design.test.ts apps/web/README.md
git commit -m "test: verify React GitHub Pages build contract"
```

## Plan Self-Review

- Spec coverage: Tasks 1–6 collectively retain static GitHub Pages delivery, `/blog` routing, all public pages, Markdown source, current presentation, guestbook API behavior, accessibility feedback, and verification requirements.
- Placeholder scan: no unfinished requirements or deferred implementation markers remain.
- Type consistency: the generated `DiaryArticle` contract is introduced before all page/component consumers; guestbook URL and API function contracts are introduced before the page consumer.
