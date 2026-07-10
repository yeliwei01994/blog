# Minimal Diary Refactor Implementation Plan

**Goal:** Reduce FORM / FUTURE to a minimal personal diary with only home, diary, about, and 404 pages.

**Architecture:** Keep Astro static generation and a typed content collection, but rename the public content concept from posts to diary entries. Remove archive, tags, search, sample entries, sample covers, and technology-stack marketing content.

**Verification:** Route inventory tests, content helper tests, Astro check, clean production build, build-output tests, and 375px overflow verification.

## Tasks

1. Change navigation and tests to the desired minimal route inventory.
2. Rename content helpers, collection, components, and routes from posts to diary.
3. Delete sample content, covers, archive, tags, and search implementation.
4. Replace home/about copy with the approved concise biography and empty diary state.
5. Run fresh tests/build/QA, commit, and push the feature branch.
