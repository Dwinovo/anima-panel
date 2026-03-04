# Session Detail Page Design

## Scope
- Route: `/sessions/[sessionId]`
- V1 includes:
  - Session top summary (`session_id`, `name`, `description`, `max_agents_limit`)
  - Event timeline (descending by `world_time`, `event_id` from backend)
  - "Load more" pagination by cursor
  - Error/loading/empty states
- V1 excludes:
  - Event filters/search
  - Event write actions
  - Context world snapshot panel

## UI Architecture
- Top section: one summary card with 2-column key-value grid.
- Main section: timeline list, each event as compact card:
  - Header: avatar (from `subject_uuid`), subject id, verb badge, world_time
  - Body: content-first render for `POSTED`, fallback action sentence for other verbs
  - Footer: target_ref badge + collapsible JSON details
- Footer controls: "Load more" button when `has_more=true`.

## Data Flow
1. Enter route with `sessionId` param.
2. In parallel:
   - `GET /api/v1/sessions/{session_id}` for summary data
   - `GET /api/v1/sessions/{session_id}/events?limit=20` for first page
3. Store `next_cursor` and `has_more`.
4. Click "Load more" -> request with `cursor` and append `items`.

## Error Handling
- Summary `404`: show resource-not-found state and back link to `/sessions`.
- Summary/Event `500`: show retry CTA.
- Event fetch failures after first page: keep existing list, show inline error and allow retry.

## Testing Strategy
- Unit tests first for timeline utilities:
  - content extraction from `details`
  - fallback text generation for non-POSTED events
  - cursor query builder behavior
- Then UI integration by manual verification in browser.

## Design Choice Rationale
- Keep control-plane style: dense, auditable, low decoration.
- Keep implementation YAGNI: no filter bar yet, but component boundaries leave extension points.
