# Guestbook API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a local Node.js API that reads guestbook messages from PostgreSQL while the Astro frontend remains a static GitHub Pages site.

**Architecture:** The API lives in `api/`, uses Node's HTTP server and `pg`, and reads `DATABASE_URL` from `api/.env`. The first endpoint is `GET /api/messages`; Astro frontend changes are deferred.

**Tech Stack:** Node.js 22+, TypeScript, `pg`, Vitest, PostgreSQL.

## Global Constraints

- Keep `output: 'static'` in `astro.config.mjs`.
- Never commit `api/.env` or expose `DATABASE_URL` to browser code.
- Use parameterized SQL.
- Do not add write endpoints in this milestone.

### Task 1: Scaffold API and test the messages query

**Files:** Create `api/package.json`, `api/tsconfig.json`, `api/src/messages.test.ts`, `api/src/messages.ts`.

- Add an API package with `pg`, TypeScript, and Vitest.
- Write a test for mapping a database row to the public message shape.
- Implement the minimal query function with an injected database client.

### Task 2: Add HTTP server

**Files:** Create `api/src/server.test.ts`, `api/src/server.ts`.

- Test `GET /api/messages` returns JSON.
- Test unknown routes return 404.
- Implement a Node HTTP server using the query module.

### Task 3: Add local configuration and verification

**Files:** Create `api/.env.example`; modify `.gitignore` and `api/package.json` if needed.

- Document `DATABASE_URL`.
- Add scripts to run, test, and typecheck the API.
- Run API tests, the Astro checks, and a real local database request.
