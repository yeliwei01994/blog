# Diary Code Window Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render Markdown diary code blocks as accessible window-style code cards matching the approved reference design.

**Architecture:** Keep Markdown fenced code blocks unchanged. Add semantic toolbar metadata around rendered `pre` elements in `DiaryLayout.astro`, derive the language label from the code class, and style the toolbar, line numbers, scrolling, copy control, and theme variants in `editorial.css`.

**Tech Stack:** Astro 7, Markdown rendering, TypeScript, CSS, Vitest.

## Global Constraints

- Do not add a code-highlighting dependency.
- Preserve plain-code clipboard output.
- Unlabelled blocks display `PLAINTEXT`.
- Validate with `npm test`, `npm run check`, and `npm run build`.

### Task 1: Add failing regression coverage

**Files:** Modify `tests/build.test.ts`.

- [ ] Assert the rendered diary page contains a code-window toolbar and `PLAINTEXT` fallback.
- [ ] Run the focused test and confirm it fails because the markers do not exist.

### Task 2: Add code-window structure

**Files:** Modify `src/layouts/DiaryLayout.astro`.

- [ ] Derive a language from classes such as `language-rust`, defaulting to `PLAINTEXT`.
- [ ] Wrap each `pre` in title/body structure while keeping code text intact.
- [ ] Keep the copy button accessible and preserve clipboard behavior.

### Task 3: Style the code window

**Files:** Modify `src/styles/editorial.css`.

- [ ] Add rounded panel, title bar, traffic-light dots, mono typography, and line-number counter.
- [ ] Add dark-theme overrides and small-screen overflow behavior.
- [ ] Keep the copy button keyboard-focusable and aligned in the toolbar.

### Task 4: Verify and review

- [ ] Run `npm test`, `npm run check`, and `npm run build`.
- [ ] Inspect the diff and built HTML.
- [ ] Commit with `feat: style diary code blocks as windows`.
