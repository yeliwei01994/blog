# PostgreSQL Learning Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the Astro blog deployed as a static GitHub Pages site while adding PostgreSQL-backed dynamic features through an external API.

**Architecture:** GitHub Pages serves the static Astro frontend. A separate API service owns the database connection and exposes narrowly scoped HTTPS endpoints. The first feature is a guestbook or comment list, while Markdown remains the source of diary content.

**Tech Stack:** PostgreSQL, Node.js API, `pg` or Drizzle ORM, Astro client-side `fetch`, environment variables, GitHub Actions.

## Global Constraints

- Keep `output: 'static'` in `astro.config.mjs`.
- Never put database credentials in Astro client code or `PUBLIC_*` variables.
- Keep Markdown diary content unchanged during the first milestone.
- The public API must validate input and use parameterized SQL.

## Milestones

1. Verify local PostgreSQL and create a dedicated database/user.
2. Create one small API service and a `guestbook_messages` table.
3. Test the API locally with `curl` or a REST client.
4. Add a static Astro guestbook UI that calls the API.
5. Deploy the API separately and configure its CORS/database secrets.
6. Deploy the unchanged static frontend to GitHub Pages.
7. Add migrations, tests, rate limiting, and moderation before adding comments or admin features.
