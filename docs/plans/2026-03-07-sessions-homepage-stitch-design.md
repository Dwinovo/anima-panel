# Sessions Homepage Stitch Design

## Goal

Rebuild `/sessions` using the provided Stitch screen visual language while keeping real Session CRUD integration through existing `sessionService`.

## Context

- Existing route pages were intentionally deleted for refactor.
- `features/sessions/services/*` and `features/sessions/types.ts` are still intact.
- Current stack is Next.js App Router + TypeScript + Tailwind + shadcn/ui.

## Design Decisions

### 1. Page shell

- Use a desktop-first console layout:
  - fixed left sidebar (`md+`)
  - sticky top header
  - content section with hero, stats cards, and data table
- On small screens, collapse into single-column layout with hidden sidebar and full-width content.

### 2. Data model and behavior

- Keep `listSessions/createSession/updateSession/deleteSession` from `sessionService`.
- Add local search by `session_id`, `name`, and `description`.
- Add derived stats from loaded data:
  - active sessions = filtered list count
  - total capacity = sum of `max_agents_limit`
  - average capacity = rounded average
- Keep pagination footer as visual-only placeholder for this stage (no backend page API in current contract).

### 3. Components

- `app/page.tsx`: redirect to `/sessions`.
- `app/sessions/page.tsx`: server route entry + metadata.
- `features/sessions/components/SessionsPageClient.tsx`: state/data orchestration.
- `features/sessions/components/SessionsLayoutChrome.tsx`: sidebar + top header + content shell.
- `features/sessions/components/SessionStatsCards.tsx`: derived metric cards.
- `features/sessions/components/SessionsDataTable.tsx`: table and row actions.
- `features/sessions/components/SessionFormDialog.tsx`: create/edit dialog.
- `features/sessions/components/DeleteSessionDialog.tsx`: delete confirmation.
- `features/sessions/components/sessionPageViewModel.ts`: pure helpers for filtering/stats.

### 4. Testing strategy

- TDD at pure function layer:
  - add `sessionPageViewModel.test.ts` first
  - verify fail
  - implement `sessionPageViewModel.ts`
  - verify pass
- Keep existing service tests unchanged.

### 5. Non-goals

- No detail page rebuild in this task.
- No backend pagination API extension.
- No auth/session context changes.

