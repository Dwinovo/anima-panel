# Session Management Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready `/sessions` management page with list/create/edit/delete flows aligned with Anima API and UI docs.

**Architecture:** Use App Router with a server route entry (`app/sessions/page.tsx`) and a client feature module for interactive state and dialogs. API calls are isolated in `features/sessions/services/sessionService.ts`, while UI components remain in `features/sessions/components/*` and consume typed contracts. Keep validation, error mapping, and rendering concerns separated to match Next.js code-style guidance.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind + shadcn/ui, Vitest (unit tests for validation/error mapping).

---

### Task 1: Scaffold Session feature modules

**Files:**
- Create: `app/sessions/page.tsx`
- Create: `features/sessions/components/SessionsPageClient.tsx`
- Create: `features/sessions/components/SessionFormDialog.tsx`
- Create: `features/sessions/components/DeleteSessionDialog.tsx`
- Create: `features/sessions/components/SessionsTable.tsx`
- Create: `features/sessions/services/sessionService.ts`
- Create: `features/sessions/services/sessionValidation.ts`
- Create: `features/sessions/types.ts`

**Step 1:** Create typed API/model contracts from docs.

**Step 2:** Add service functions for `GET/POST/PATCH/DELETE /api/v1/sessions`.

**Step 3:** Add base UI component shells and compose in `/sessions` route.

### Task 2: Add tests first for validation and API errors

**Files:**
- Create: `features/sessions/services/sessionValidation.test.ts`
- Create: `features/sessions/services/sessionService.test.ts`
- Create: `vitest.config.ts`

**Step 1: Write the failing tests**
- Validation test for required `name`.
- Validation test for positive integer `max_agents_limit`.
- Service test for HTTP `400/404/500` message mapping.

**Step 2: Run test to verify it fails**
- Run: `pnpm vitest run`
- Expected: failures because implementation is missing.

**Step 3: Write minimal implementation**
- Implement validation and error mapping utilities.

**Step 4: Run test to verify it passes**
- Run: `pnpm vitest run`
- Expected: all tests pass.

### Task 3: Implement Session management interactions

**Files:**
- Modify: `features/sessions/components/SessionsPageClient.tsx`
- Modify: `features/sessions/components/SessionFormDialog.tsx`
- Modify: `features/sessions/components/DeleteSessionDialog.tsx`
- Modify: `features/sessions/components/SessionsTable.tsx`

**Step 1:** Load sessions with loading/empty/error states.

**Step 2:** Implement create/edit dialogs with inline validation messages.

**Step 3:** Implement delete confirmation flow.

**Step 4:** Add toast feedback and list refresh on every mutation.

### Task 4: Verify and polish

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

**Step 1:** Add `Sonner` provider to app layout.

**Step 2:** Redirect home route to `/sessions`.

**Step 3:** Run `pnpm lint` and `pnpm vitest run` and fix issues.

**Step 4:** Ensure UI copy/spacing aligns with `docs/AnimaUI设计理念.md`.
