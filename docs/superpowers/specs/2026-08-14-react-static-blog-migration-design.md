# React Static Blog Migration Design

## Goal

Replace the Astro frontend in `apps/web` with a Vite, React, and TypeScript frontend while preserving the existing blog's public URLs, Markdown articles, visual design, guestbook API integration, and GitHub Pages deployment.

## Scope

- Build the React frontend as static files for GitHub Pages.
- Preserve the configured public base path: `/blog`.
- Preserve these public routes: `/`, `/diary`, `/diary/:id`, `/about`, `/guestbook`, and the GitHub Pages 404 page.
- Preserve the existing Markdown diary files and their frontmatter.
- Preserve the current editorial CSS and all visible page features: site navigation, footer, theme switching, home hero, diary cards, article metadata, table of contents, reading progress, and code-copy controls.
- Preserve the existing guestbook HTTP API contract and its loading, success, and error states.
- Remove Astro runtime, Astro components, and Astro-specific configuration from the web app once React equivalents are working.

## Non-goals

- Do not change the guestbook API service, database schema, or deployment.
- Do not redesign the site or change its copy except where framework-specific markup requires equivalent accessible wording.
- Do not introduce server-side rendering, a Node runtime in production, authentication, a CMS, or a new backend.
- Do not change published article identifiers or edit article content.

## Architecture

`apps/web` becomes a Vite React TypeScript project. Vite produces the static `dist` directory with `base: '/blog/'`, which GitHub Pages serves directly.

At build time, a small content-generation step reads `src/content/diary/*.md`, validates the expected frontmatter, renders Markdown into sanitized article HTML, and writes a typed generated data module. React consumes that generated module for the diary index and article route. This keeps all published content available in the generated static bundle without a runtime server or filesystem access in the browser.

React Router handles client navigation and maps the existing routes. The Vite build also emits a GitHub Pages-compatible `404.html`; it records an unknown deep route before redirecting to the app, then React Router restores it. The built site must work both when opened on `/blog/` and when a reader directly opens a published diary URL.

## Component Boundaries

- `app`: router setup, route restoration, and top-level layout composition.
- `site`: site configuration, URL helpers, header, footer, and theme control.
- `features/home`: homepage hero and content sections.
- `features/diary`: generated article data access, diary cards, metadata, table of contents, reading progress, and copy buttons.
- `features/guestbook`: guestbook API client, form, message list, and request-state UI.
- `styles`: migrated global, editorial, and guestbook CSS; class names remain stable where possible to preserve presentation.

Components receive plain typed props and do not read global DOM state except for browser-only behavior such as local storage, scrolling, clipboard access, and document headings.

## Content and Routing Data Flow

1. The content-generation script discovers every diary Markdown file except `_template.md`.
2. It parses and validates the current article frontmatter fields, derives the existing article identifier from its filename, and outputs title, publication date, description, tags, rendered HTML, and heading metadata.
3. The diary index sorts this generated data by publication date and renders cards linking to `/diary/:id` through the configured base path.
4. The article route finds one generated article by ID and renders its HTML, metadata, table of contents, code-copy controls, and reading-progress control. A missing ID renders the site 404 view.
5. The guestbook route reads `VITE_GUESTBOOK_API_BASE_URL` (with the current local development fallback), fetches messages, then posts form data using the unchanged API endpoints.

## Error Handling and Accessibility

- An unparseable article or missing required frontmatter makes the production build fail with the source filename in the error.
- A requested article ID not present in generated data shows the same accessible 404 page used for unmatched routes.
- Guestbook network failures remain visible in the existing live status area and leave entered form content intact.
- Clipboard failures report a local, readable failure state instead of silently claiming success.
- Theme choice is restored from local storage when available and defaults to the operating system preference otherwise.
- Semantic headings, labels, button names, landmark elements, focus behavior, and the guestbook `aria-live` messages remain intact.

## Testing and Verification

- Unit-test frontmatter parsing, filename-to-ID handling, article sorting, and generated article lookup with representative diary fixtures.
- Unit-test base-path URL helpers and the client-side fallback-route restoration logic.
- Unit-test guestbook request-state behavior with mocked HTTP boundaries only; test component behavior rather than implementation details.
- Run the React test suite, TypeScript checking, and a production Vite build.
- Inspect the build output for `index.html`, `404.html`, and diary article data; smoke-test the production preview at the `/blog/` base path and a direct diary URL.

## Constraints

- Node.js version remains `>=22.12.0`.
- The final frontend is Vite + React + TypeScript and uses static GitHub Pages deployment.
- The base path remains exactly `/blog` in production.
- Existing Markdown content, public URLs, styling, and guestbook API behavior are preserved.
