# Sessions Homepage Stitch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `/sessions` with Stitch visual structure and real Session CRUD/search behavior.

**Architecture:** Restore App Router entries and mount a client-side feature module that owns data fetching and mutations. Keep view derivation in a pure helper module to enable TDD. Use small presentational components for layout chrome, stats, table, and dialogs so style and behavior stay decoupled.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Vitest.

---

### Task 1: Add view-model tests first (RED)

**Files:**
- Create: `features/sessions/components/sessionPageViewModel.test.ts`

**Step 1:** Write tests for:
- search matching `session_id`
- search matching `name` case-insensitively
- stats aggregation (`activeSessions`, `totalCapacity`, `averageCapacity`)

**Step 2:** Run failing test command

Run: `pnpm vitest run features/sessions/components/sessionPageViewModel.test.ts`
Expected: FAIL because `sessionPageViewModel.ts` is missing.

### Task 2: Implement view-model helpers (GREEN)

**Files:**
- Create: `features/sessions/components/sessionPageViewModel.ts`

**Step 1:** Implement `filterSessionsByQuery`.

**Step 2:** Implement `buildSessionsStats`.

**Step 3:** Run test command again.

Run: `pnpm vitest run features/sessions/components/sessionPageViewModel.test.ts`
Expected: PASS.

### Task 3: Restore routes and page orchestration

**Files:**
- Create: `app/page.tsx`
- Create: `app/sessions/page.tsx`
- Create: `features/sessions/components/SessionsPageClient.tsx`

**Step 1:** Re-add root redirect and sessions page metadata.

**Step 2:** Implement client orchestration for:
- load sessions
- create/edit/delete flows
- local search state
- derived stats wiring

**Step 3:** Keep API logic in existing `features/sessions/services/sessionService.ts`.

### Task 4: Build Stitch-style UI components

**Files:**
- Create: `features/sessions/components/SessionsLayoutChrome.tsx`
- Create: `features/sessions/components/SessionStatsCards.tsx`
- Create: `features/sessions/components/SessionsDataTable.tsx`
- Create: `features/sessions/components/SessionFormDialog.tsx`
- Create: `features/sessions/components/DeleteSessionDialog.tsx`

**Step 1:** Build sidebar/topbar layout and responsive behavior.

**Step 2:** Build stats cards and search input section.

**Step 3:** Build data table actions and wire edit/delete callbacks.

**Step 4:** Build create/edit and delete dialogs with validation/error display.

### Task 5: Verify quality gates

**Files:**
- Modify if needed after lint/test feedback

**Step 1:** Run full tests.

Run: `pnpm vitest run`
Expected: PASS.

**Step 2:** Run linter.

Run: `pnpm lint`
Expected: PASS.

**Step 3:** Run production build.

Run: `pnpm build`
Expected: PASS.

