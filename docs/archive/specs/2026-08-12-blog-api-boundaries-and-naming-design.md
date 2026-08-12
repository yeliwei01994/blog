# Blog API Boundaries and Naming Design

## Goal

Keep the Astro blog deliberately small while making the guestbook API independently deployable, safer at its public boundary, and easier to extend. Establish naming rules that follow the conventions of Astro, TypeScript, HTTP, PostgreSQL, and environment configuration instead of applying camel case indiscriminately.

## Scope and non-goals

This design covers the guestbook API boundary, its PostgreSQL schema lifecycle, the guestbook front-end module boundary, root-level developer commands, and project-wide naming conventions.

It does not change the GitHub Pages deployment address, `base` path, diary URLs and frontmatter, existing `GET /api/messages` and `POST /api/messages` JSON shapes, `DATABASE_URL`, `PUBLIC_API_BASE_URL`, port `3000`, or the existing `guestbook_messages` table and its data. It does not add a framework, ORM, authentication, rate-limit provider, monorepo tool, or a new database.

### Scope amendment — lightweight personal-blog implementation

The approved implementation is intentionally narrower than the initial design: retain the compact API structure as-is, and do not add CORS hardening, health endpoints, migrations, database abstraction layers, API deployment automation, or database workflow tooling. This round implements only the frontend guestbook feature boundary, naming guidance, the missing diary template, and convenient commands for checks that already exist.

## Current architecture and constraints

The repository contains two runtime units:

- The root Astro application is a static site. `src/pages/` owns file-based routes; layouts assemble components; `src/content/diary/` owns Markdown content; `src/lib/` owns content and URL helpers.
- `api/` is a separate Node HTTP process that reads and writes PostgreSQL data. The static `/guestbook/` page calls it from the browser through `PUBLIC_API_BASE_URL`.

The GitHub Actions workflow publishes only the static Astro build. Therefore API deployment and database initialization must be explicit rather than implicit in the blog deployment.

## Design decisions

### 1. Preserve the Astro structure; create one feature boundary only where needed

The existing `pages`, `layouts`, `components`, `content`, `config`, `lib`, and `styles` divisions are appropriate for this small editorial site. No global `common`, `shared`, or generalized domain layer will be introduced.

The guestbook is the exception because it contains a page-specific form, browser-side data access, presentation, and error states. Move its implementation under `src/features/guestbook/`:

```text
src/
├─ features/
│  └─ guestbook/
│     ├─ Guestbook.astro          # feature UI assembly
│     ├─ guestbook-client.ts      # browser fetch and DOM interaction
│     └─ guestbook.css            # feature-only styles
└─ pages/
   └─ guestbook.astro             # route and feature assembly only
```

`src/pages/guestbook.astro` remains the owner of `/guestbook/`; moving implementation files must not change the public route.

### 2. Give the API explicit HTTP, domain, and infrastructure responsibilities

The API remains framework-free. Its files are split only enough to keep HTTP concerns, guestbook behavior, and PostgreSQL implementation from leaking into each other:

```text
api/
├─ src/
│  ├─ app/
│  │  ├─ create-server.ts         # HTTP server, routes, CORS, body limits, response helpers
│  │  └─ config.ts                # validated runtime configuration
│  ├─ guestbook/
│  │  ├─ message-service.ts       # input validation and response DTO mapping
│  │  ├─ message-repository.ts    # repository interface
│  │  └─ message-types.ts         # stable internal types
│  ├─ infrastructure/
│  │  └─ postgres-message-repository.ts # SQL implementation of the repository
│  └─ server.ts                   # process entry point only
├─ migrations/
│  └─ 001_create_guestbook_messages.sql
└─ tests/
```

Dependency direction is one-way: `app -> guestbook -> message-repository interface <- infrastructure`. `server.ts` composes the concrete PostgreSQL repository with the HTTP application. The HTTP layer never embeds SQL; the domain layer does not import `pg` or Node HTTP types.

### 3. Treat guestbook API behavior as a public contract

`GET /api/messages` continues to return the current JSON array. `POST /api/messages` continues to accept `{ name, message }` and return the created message. CORS will allow only configured origins in production, with an explicit local-development origin list. Requests receive an explicit body-size limit and a response for permitted preflight requests.

The API will add a non-conflicting `GET /health` endpoint for deployment health checks. It returns a small JSON status and does not disclose credentials or database details.

### 4. Version the database schema from now on

The first migration records the existing `guestbook_messages` contract using an idempotent `CREATE TABLE IF NOT EXISTS` statement. The migration runner and documentation must make the execution order explicit. Existing databases are not dropped, recreated, or modified outside that compatible definition.

### 5. Establish precise naming conventions

Camel case is one convention, not a universal rule. Names must follow the language, framework, protocol, or storage system that owns them.

| Context | Convention | Examples | Rule |
| --- | --- | --- | --- |
| TypeScript variables, functions, object fields | `camelCase` | `apiBaseUrl`, `getPublishedDiaryEntries`, `createdAt` | Use verbs for actions and nouns for values; avoid abbreviations unless standard (`id`, `url`, `html`). |
| TypeScript types, interfaces, classes, Astro components | `PascalCase` | `MessageRepository`, `GuestbookMessage`, `DiaryCard.astro` | Name by role, without redundant suffixes such as `Manager` or `Helper`. |
| TypeScript files | `kebab-case.ts` | `message-service.ts`, `guestbook-client.ts` | Use a role-bearing noun; component files remain `PascalCase.astro` to match component imports. |
| Directories | `kebab-case` | `features/guestbook`, `content/diary` | Name by capability, never generic `utils`, `common`, or `misc`. |
| Astro pages | Astro file-routing syntax | `diary/index.astro`, `diary/[...id].astro` | Preserve framework route names; do not rename for stylistic consistency. |
| CSS classes | `kebab-case` with BEM element/modifier notation when needed | `message-card`, `message-card__meta`, `is-loading` | Use semantic, feature-scoped names; CSS custom properties remain kebab case. |
| CSS custom properties | `--kebab-case` | `--color-accent` | Tokens state intent, not implementation or raw color values. |
| Environment variables | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `PUBLIC_API_BASE_URL`, `API_ALLOWED_ORIGINS` | Public Astro values must retain the `PUBLIC_` prefix. |
| JSON/HTTP payload fields | `camelCase` | `createdAt`, `messageId` | Preserve existing public response names; do not expose database naming. |
| HTTP headers and methods | Protocol standard | `Content-Type`, `GET`, `POST` | Never invent casing conventions for standards. |
| PostgreSQL tables and columns | `snake_case` | `guestbook_messages`, `created_at` | Match PostgreSQL conventions; map to camel case at the API boundary. |
| SQL migrations | zero-padded sequence + `snake_case.sql` | `001_create_guestbook_messages.sql` | Number indicates immutable application order. |
| Tests | subject-oriented kebab file + behavior sentence | `message-service.test.ts`; `rejects oversized messages` | The test name describes an observable contract. |
| Git branches / commits | `codex/<kebab-case>`; Conventional Commit style | `codex/guestbook-api-boundaries`; `feat(api): add health endpoint` | Only used when a branch or commit is explicitly authorized. |

Existing names are retained unless a specific rename serves the new boundary. Broad naming-only refactors are explicitly out of scope.

## Validation strategy

- Unit tests cover message validation, database-to-DTO mapping, CORS decision logic, request-size rejection, and existing GET/POST contracts.
- HTTP integration tests cover GET, valid POST, invalid POST, preflight, rejected origin, body limit, unknown route, and health endpoint.
- Migration verification runs against a disposable PostgreSQL instance or documented local test database; no production data is touched.
- Root commands run frontend tests, Astro type checking, static build, API tests, and API TypeScript checking.
- `git diff --check` and a route/build check confirm that `/guestbook/` and existing diary routes remain unchanged.

## Delivery stages

1. **API contract and database ownership:** add failing contract tests, extract layers, add migration and health endpoint, configure CORS and body limit, then verify API checks.
2. **Guestbook feature boundary:** migrate page-private UI/client/styles behind the existing route, with route and interaction checks.
3. **Developer workflow and documentation:** add root aggregation commands, correct the missing diary-template instruction, and document API deployment/migration steps.

Each stage is independently reversible by restoring only its new files and imports. No stage changes existing public routes, environment variable names, database data, or response payload names.

## Risks and mitigations

- **CORS tightening can block a deployed front end.** Allowed origins will be configured explicitly and tested with the production blog origin plus local development origin before release.
- **A migration can conflict with a pre-existing table.** The initial migration is compatible with the current table name and is verified on a disposable database before any deployment.
- **Page extraction can break static asset base paths.** Existing `withBase()` behavior and the `/guestbook/` build output are tested before and after the move.
