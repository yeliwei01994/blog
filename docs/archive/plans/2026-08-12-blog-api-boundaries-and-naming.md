# Blog API Boundaries and Naming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the guestbook API deployable and boundary-safe, move guestbook-only front-end code into one feature module, and codify ecosystem-appropriate naming conventions without changing existing public contracts.

**Architecture:** Keep the static Astro blog and the Node/PostgreSQL API as separate runtime units. Within the API, compose the HTTP app from a guestbook service and a PostgreSQL repository; within the frontend, keep `/guestbook/` as the route and move only page-private implementation into `src/features/guestbook/`.

**Tech Stack:** Astro 7 static site, TypeScript 5, Vitest 4, Node HTTP, PostgreSQL via `pg`, GitHub Pages.

## Scope amendment — 2026-08-12

The project owner chose a deliberately lightweight personal-blog scope. Do not execute Tasks 1-3: the API remains the existing compact `db.ts`, `messages.ts`, and `server.ts` arrangement. Do not add CORS policy configuration, body-size hardening, health endpoints, migrations, repository layers, API deployment automation, or database workflow tooling.

Execute only the simplified equivalents of Tasks 4 and 5: move guestbook page-private presentation, browser code, and styles into a single frontend feature directory; add the missing diary template; document the naming conventions; and add convenient root scripts for the checks that already exist. Preserve all current browser-visible guestbook behavior and API contracts.

## Global Constraints

- Preserve the GitHub Pages deployment address, `/blog` base path, all current diary URLs and frontmatter fields.
- Preserve `GET /api/messages`, `POST /api/messages`, their existing JSON payload fields, `DATABASE_URL`, `PUBLIC_API_BASE_URL`, the API default port `3000`, and existing `guestbook_messages` data.
- Use `camelCase` for TypeScript values and HTTP/JSON fields, `PascalCase` for TypeScript types and Astro components, `kebab-case` for TypeScript files/directories/CSS classes, `UPPER_SNAKE_CASE` for environment variables, and `snake_case` for PostgreSQL identifiers and SQL migrations.
- Do not introduce an ORM, a frontend framework, authentication, a rate-limit service, a monorepo tool, or a database replacement.
- Do not commit, push, deploy, modify production data, or execute migrations against a non-disposable database without explicit user authorization.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `api/src/app/config.ts` | Parse server-only runtime configuration and allowed browser origins. |
| `api/src/app/create-server.ts` | Own HTTP routing, CORS/preflight, body-size handling, JSON response writing, and server construction. |
| `api/src/guestbook/message-types.ts` | Own `GuestbookMessage`, `CreateMessageInput`, and repository row types. |
| `api/src/guestbook/message-repository.ts` | Define the database-independent message repository interface. |
| `api/src/guestbook/message-service.ts` | Validate caller input and map repository rows to public camel-case DTOs. |
| `api/src/infrastructure/postgres-message-repository.ts` | Implement the repository interface with PostgreSQL SQL. |
| `api/src/server.ts` | Compose config, PostgreSQL repository, and HTTP server; start the process. |
| `api/migrations/001_create_guestbook_messages.sql` | Record the compatible guestbook table contract. |
| `api/src/**/*.test.ts` | Unit and HTTP contract tests. |
| `src/features/guestbook/Guestbook.astro` | Assemble guestbook markup and feature assets. |
| `src/features/guestbook/guestbook-client.ts` | Own browser fetch, submission, UI-state and safe DOM rendering. |
| `src/features/guestbook/guestbook.css` | Own guestbook-only visual styles. |
| `src/pages/guestbook.astro` | Preserve route ownership and pass the public API base URL to the feature. |
| `package.json` and `README.md` | Provide root verification commands and accurate developer guidance. |

## Task 1: Establish API domain contracts and validation

**Files:**
- Create: `api/src/guestbook/message-types.ts`
- Create: `api/src/guestbook/message-repository.ts`
- Create: `api/src/guestbook/message-service.ts`
- Create: `api/src/guestbook/message-service.test.ts`
- Modify: `api/src/messages.ts`
- Modify: `api/src/messages.test.ts`

**Interfaces:**
- Consumes: `MessageRow` values shaped as `{ id: number; name: string; message: string; created_at: Date }`.
- Produces: `GuestbookMessage` shaped as `{ id: number; name: string; message: string; createdAt: string }`; `validateCreateMessage(input: unknown): CreateMessageInput`; `MessageRepository.list(): Promise<MessageRow[]>`; `MessageRepository.create(input: CreateMessageInput): Promise<MessageRow>`.

- [ ] **Step 1: Write failing service tests**

```ts
it('maps database snake_case rows to public camelCase messages', async () => {
  const service = createMessageService({
    list: async () => [{ id: 1, name: '小明', message: '学习中', created_at: new Date('2026-07-14T08:00:00.000Z') }],
    create: async () => { throw new Error('not called'); },
  });
  await expect(service.list()).resolves.toEqual([
    { id: 1, name: '小明', message: '学习中', createdAt: '2026-07-14T08:00:00.000Z' },
  ]);
});

it('rejects missing and oversized message input', () => {
  expect(() => validateCreateMessage({ name: '', message: 'hello' })).toThrow('Name and message are required');
  expect(() => validateCreateMessage({ name: 'A'.repeat(81), message: 'hello' })).toThrow('Name and message are required');
});
```

- [ ] **Step 2: Run the service test to verify it fails**

Run: `npm --prefix api test -- src/guestbook/message-service.test.ts`

Expected: FAIL because `message-service.ts` and its exported functions do not exist.

- [ ] **Step 3: Implement the minimal domain contracts**

```ts
export interface CreateMessageInput { name: string; message: string; }
export interface GuestbookMessage { id: number; name: string; message: string; createdAt: string; }
export interface MessageRepository { list(): Promise<MessageRow[]>; create(input: CreateMessageInput): Promise<MessageRow>; }

export function validateCreateMessage(input: unknown): CreateMessageInput { /* validate object, trim values, enforce 80/2000 limits */ }
export function createMessageService(repository: MessageRepository) { /* list and create public DTOs */ }
```

Move row-to-DTO conversion and validation out of `api/src/messages.ts`; retain a compatibility re-export only if an existing test or import requires it during the same task.

- [ ] **Step 4: Run the API test suite and type check**

Run: `npm --prefix api test && npm --prefix api run check`

Expected: every API test passes and TypeScript reports no errors.

- [ ] **Step 5: Commit if authorized**

```bash
git add api/src/guestbook api/src/messages.ts api/src/messages.test.ts
git commit -m "refactor(api): separate guestbook message service"
```

## Task 2: Extract PostgreSQL infrastructure and version the schema

**Files:**
- Create: `api/src/infrastructure/postgres-message-repository.ts`
- Create: `api/src/infrastructure/postgres-message-repository.test.ts`
- Create: `api/migrations/001_create_guestbook_messages.sql`
- Modify: `api/src/db.ts`
- Modify: `api/src/server.ts`

**Interfaces:**
- Consumes: `pg.Pool` and `MessageRepository` from Task 1.
- Produces: `createPostgresMessageRepository(pool: Pick<pg.Pool, 'query'>): MessageRepository`; `pool` process dependency for composition only.

- [ ] **Step 1: Write a failing repository test**

```ts
it('uses PostgreSQL snake_case SQL and passes validated values to create', async () => {
  const query = vi.fn(async () => ({ rows: [{ id: 3, name: 'Ada', message: 'Hello', created_at: new Date('2026-08-12T00:00:00.000Z') }] }));
  const repository = createPostgresMessageRepository({ query });
  await repository.create({ name: 'Ada', message: 'Hello' });
  expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO guestbook_messages'), ['Ada', 'Hello']);
});
```

- [ ] **Step 2: Run the repository test to verify it fails**

Run: `npm --prefix api test -- src/infrastructure/postgres-message-repository.test.ts`

Expected: FAIL because `postgres-message-repository.ts` does not exist.

- [ ] **Step 3: Implement the PostgreSQL adapter and compatible initial migration**

Implement `list()` with `ORDER BY created_at DESC` and `create()` with parameterized `$1`, `$2` SQL. Add an idempotent migration that defines `id`, `name`, `message`, and `created_at` for `guestbook_messages`; it must not drop, truncate, or alter existing data.

- [ ] **Step 4: Run repository and API verification**

Run: `npm --prefix api test && npm --prefix api run check`

Expected: all API tests pass and no TypeScript diagnostics are produced.

- [ ] **Step 5: Commit if authorized**

```bash
git add api/src/infrastructure api/migrations api/src/db.ts api/src/server.ts
git commit -m "feat(api): version guestbook database contract"
```

## Task 3: Add HTTP boundary configuration, CORS, limits, and health checks

**Files:**
- Create: `api/src/app/config.ts`
- Create: `api/src/app/create-server.ts`
- Create: `api/src/app/create-server.test.ts`
- Modify: `api/src/server.ts`
- Modify: `api/src/server.test.ts`
- Modify: `api/.env.example`

**Interfaces:**
- Consumes: `MessageRepository`, `createMessageService(repository)`, and `ApiConfig` shaped as `{ allowedOrigins: readonly string[]; maxRequestBodyBytes: number }`.
- Produces: `createServer(service, config): Server`; `readApiConfig(env): ApiConfig`; `GET /health` returns `{ status: 'ok' }`.

- [ ] **Step 1: Write failing HTTP contract tests**

```ts
it('returns health status without querying messages', async () => {
  const response = await fetch(`${address}/health`);
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ status: 'ok' });
});

it('allows configured browser origins and rejects other origins', async () => {
  const allowed = await fetch(`${address}/api/messages`, { headers: { Origin: 'http://localhost:4321' } });
  expect(allowed.headers.get('access-control-allow-origin')).toBe('http://localhost:4321');
  const denied = await fetch(`${address}/api/messages`, { headers: { Origin: 'https://untrusted.example' } });
  expect(denied.status).toBe(403);
});

it('rejects a request body larger than the configured byte limit', async () => {
  const response = await fetch(`${address}/api/messages`, { method: 'POST', body: 'x'.repeat(33) });
  expect(response.status).toBe(413);
});
```

- [ ] **Step 2: Run the HTTP contract test to verify it fails**

Run: `npm --prefix api test -- src/app/create-server.test.ts`

Expected: FAIL because `create-server.ts` and `ApiConfig` do not exist.

- [ ] **Step 3: Implement the minimal HTTP boundary**

Move server construction from `server.ts` into `create-server.ts`. Permit `OPTIONS` only for configured origins, return `403` for a request carrying an unconfigured `Origin`, cap request accumulation at `maxRequestBodyBytes`, and return JSON error bodies without internal error detail. Parse `API_ALLOWED_ORIGINS` as a comma-separated `UPPER_SNAKE_CASE` environment variable; document a localhost development value in `.env.example`.

- [ ] **Step 4: Run HTTP, API, and static checks**

Run: `npm --prefix api test && npm --prefix api run check`

Expected: all API contract tests pass, including old GET/POST/404 behaviors, and no TypeScript errors occur.

- [ ] **Step 5: Commit if authorized**

```bash
git add api/src/app api/src/server.ts api/src/server.test.ts api/.env.example
git commit -m "feat(api): protect guestbook HTTP boundary"
```

## Task 4: Move guestbook-only frontend code to its feature module

**Files:**
- Create: `src/features/guestbook/Guestbook.astro`
- Create: `src/features/guestbook/guestbook-client.ts`
- Create: `src/features/guestbook/guestbook.css`
- Create: `tests/guestbook.test.ts`
- Modify: `src/pages/guestbook.astro`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- Consumes: `apiBaseUrl: string` passed from the route; `GET /api/messages` and `POST /api/messages` public contract.
- Produces: `Guestbook` Astro component with `apiBaseUrl` prop; `initializeGuestbook(root: HTMLElement, apiBaseUrl: string): Promise<void>`.

- [ ] **Step 1: Write a failing feature-boundary test**

```ts
it('keeps the guestbook route thin and delegates feature behavior', () => {
  const route = fs.readFileSync('src/pages/guestbook.astro', 'utf8');
  expect(route).toContain("import Guestbook from '../features/guestbook/Guestbook.astro'");
  expect(route).not.toContain("document.querySelector('#message-form')");
});

it('uses safe DOM text assignment for API-provided message content', () => {
  const client = fs.readFileSync('src/features/guestbook/guestbook-client.ts', 'utf8');
  expect(client).toContain('.textContent = item.name');
  expect(client).toContain('.textContent = item.message');
});
```

- [ ] **Step 2: Run the feature test to verify it fails**

Run: `npm test -- --run tests/guestbook.test.ts`

Expected: FAIL because the feature directory and imports do not exist.

- [ ] **Step 3: Extract the feature without changing route or payload contracts**

Move the current markup into `Guestbook.astro`, extract the inline script into `guestbook-client.ts`, and move the local `<style>` into `guestbook.css`. Retain the route's `PUBLIC_API_BASE_URL` fallback and pass it as a component prop. Keep API content rendered with `textContent`, preserve Chinese status messages, and preserve `/guestbook/`.

- [ ] **Step 4: Run frontend verification**

Run: `npm test -- --run && npm run check && npm run build`

Expected: all frontend tests pass, Astro type checking reports no diagnostics, and the static build includes `dist/guestbook/index.html`.

- [ ] **Step 5: Commit if authorized**

```bash
git add src/features/guestbook src/pages/guestbook.astro tests/guestbook.test.ts tests/routes.test.ts
git commit -m "refactor(web): isolate guestbook feature"
```

## Task 5: Add root verification commands and accurate operating documentation

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Create: `src/content/diary/_template.md`
- Modify: `tests/build.test.ts`

**Interfaces:**
- Consumes: existing `npm` scripts in the root and `api/` package.
- Produces: root `test:api`, `check:api`, and `verify` scripts; a documented API launch, migration, and deployment checklist.

- [ ] **Step 1: Write failing workflow/documentation tests**

```ts
it('emits the static guestbook route after build', () => {
  expect(fs.existsSync('dist/guestbook/index.html')).toBe(true);
});

it('provides the documented diary template', () => {
  expect(fs.existsSync('src/content/diary/_template.md')).toBe(true);
});
```

- [ ] **Step 2: Run the workflow test to verify it fails**

Run: `npm test -- --run tests/build.test.ts`

Expected: FAIL because the guestbook artifact assertion is absent and `_template.md` does not exist.

- [ ] **Step 3: Add minimal root scripts and documentation**

Add `test:api`, `check:api`, and `verify` scripts. `verify` runs root tests, Astro check, Astro build, API tests, and API type checking in that order. Update README with separate frontend/API startup commands, required API variables, migration execution guidance, `/health` deployment check, the naming-convention table, and the existing GitHub Pages limitation that it deploys the static site only. Add the current diary frontmatter template at the path documented by README.

- [ ] **Step 4: Run full repository verification**

Run: `npm run verify && git diff --check && git status --short`

Expected: all frontend and API checks pass, static build completes, diff check has no output, and the status lists only this plan's scoped files.

- [ ] **Step 5: Commit if authorized**

```bash
git add package.json README.md src/content/diary/_template.md tests/build.test.ts
git commit -m "docs: document blog and API operating boundaries"
```

## Plan self-review

- Coverage: Tasks 1-3 implement the API boundary, database ownership, health check, CORS, and request limit; Task 4 implements the frontend feature boundary; Task 5 implements workflow, content template, and documentation.
- Naming: every created path follows the specified directory/file convention; all exposed TypeScript and JSON interfaces declare their required casing.
- Contract protection: every task explicitly preserves routes, environment variable names, message API payload shape, table name, and data.
- Scope: the plan does not add an ORM, deployment provider, authentication, or rate limiter.
