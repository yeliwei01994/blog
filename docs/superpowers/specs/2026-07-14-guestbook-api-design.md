# Guestbook API Design

## Goal

Add a small local Node.js API that reads guestbook messages from PostgreSQL while keeping the Astro site statically deployable to GitHub Pages.

## Architecture

The existing Astro app remains in `src/` with `output: 'static'`. A separate `api/` workspace starts an HTTP server on port 3000 and owns the PostgreSQL connection. The first endpoint is `GET /api/messages`; the browser will consume it later through `fetch()`.

## Scope

- Create `api/package.json` and `api/tsconfig.json`.
- Use the `pg` package and a `DATABASE_URL` environment variable.
- Add a database module with a connection pool.
- Add a messages query module that returns `id`, `name`, `message`, and `created_at`.
- Add an HTTP route returning JSON for `GET /api/messages`.
- Return `404` for unknown routes and `500` with a generic message for database failures.
- Do not add write endpoints, authentication, frontend changes, or production deployment in this milestone.

## Security and Constraints

- Never expose `DATABASE_URL` to Astro client code.
- Use parameterized SQL, even for the initial read query.
- Do not commit `api/.env`.
- Keep the API separate so it can later be deployed independently from GitHub Pages.

## Success Criteria

Running the API locally and requesting `GET http://localhost:3000/api/messages` returns HTTP 200 JSON containing the test row already stored in PostgreSQL.
