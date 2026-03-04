# Session Detail Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `/sessions/[sessionId]` Session detail page with summary card, event timeline, and cursor-based load-more flow.

**Architecture:** Extend the existing Session service layer with detail and event APIs, then render the page through a client feature component. Keep event rendering logic in small reusable components and utilities, with the route file only passing params. Add unit tests for URL/cursor and event text utility behavior before implementation.

**Tech Stack:** Next.js App Router, TypeScript, shadcn/ui, Vitest.

---

### Task 1: Add types and service APIs

**Files:**
- Modify: `features/sessions/types.ts`
- Modify: `features/sessions/services/sessionService.ts`
- Modify: `features/sessions/services/sessionService.test.ts`

**Step 1: Write failing tests**
- Add tests for session-events URL builder with `limit` and `cursor`.

**Step 2: Run test to verify it fails**
Run: `pnpm vitest run features/sessions/services/sessionService.test.ts`
Expected: FAIL because event URL builder is missing.

**Step 3: Write minimal implementation**
- Add event list and pagination types.
- Add `getSessionById()` and `listSessionEvents()`.
- Add event URL builder and wire to API base URL.

**Step 4: Run test to verify it passes**
Run: `pnpm vitest run features/sessions/services/sessionService.test.ts`
Expected: PASS.

### Task 2: Add event presentation utilities (TDD)

**Files:**
- Create: `features/sessions/services/sessionEventUtils.ts`
- Create: `features/sessions/services/sessionEventUtils.test.ts`

**Step 1: Write failing tests**
- POSTED + `details.content` text extraction.
- Non-POSTED fallback summary sentence.
- Missing content fallback.

**Step 2: Run test to verify it fails**
Run: `pnpm vitest run features/sessions/services/sessionEventUtils.test.ts`
Expected: FAIL because utility file is missing.

**Step 3: Write minimal implementation**
- Implement deterministic content resolver and fallback formatter.

**Step 4: Run test to verify it passes**
Run: `pnpm vitest run features/sessions/services/sessionEventUtils.test.ts`
Expected: PASS.

### Task 3: Build Session detail UI

**Files:**
- Create: `app/sessions/[sessionId]/page.tsx`
- Create: `features/sessions/components/SessionDetailPageClient.tsx`
- Create: `features/sessions/components/SessionEventTimeline.tsx`
- Create: `features/sessions/components/SessionEventCard.tsx`

**Step 1:** Build route entry and main page shell.

**Step 2:** Fetch summary + first event page on mount.

**Step 3:** Implement load-more with cursor append.

**Step 4:** Implement loading/error/empty states and not-found handling.

### Task 4: Verify integration quality

**Files:**
- Modify: `features/sessions/components/SessionsTable.tsx` (link remains intact and verified)
- Modify: `README.md` (optional short route note)

**Step 1:** Run full test suite.
Run: `pnpm vitest run`
Expected: PASS.

**Step 2:** Run lint and build.
Run: `pnpm lint && pnpm build`
Expected: PASS.

**Step 3:** Manual check path
- Open `/sessions`
- Click one row `View details`
- Verify summary + timeline + load-more behavior.
