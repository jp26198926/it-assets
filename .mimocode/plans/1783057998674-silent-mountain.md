# Fix Tickets Default View Filtering & Post-Create Refresh

## Problem Analysis

**Issue 2 (root cause identified):** After creating a ticket, `handleFormSubmit` in `page.tsx:110` calls `getTickets(activeFilters)`, but `activeFilters` is initialized as `{}` (empty object) on line 30 and never updated after the initial load. With empty filters, the service returns ALL tickets without any default_view filtering.

**Issue 1 (likely already correct):** The default view logic in `ticket-service.ts:629-635` correctly uses `$or` to show today's tickets (any status) + Open/In Progress tickets. The initial load passes `{ default_view: true }` directly, so this works on page navigation.

## Fix

### File: `app/(dashboard)/tickets/page.tsx`

**Change line 30** — Initialize `activeFilters` with the default view flag:

```diff
- const [activeFilters, setActiveFilters] = useState<TicketFilters>({});
+ const [activeFilters, setActiveFilters] = useState<TicketFilters>({ default_view: true });
```

This ensures that every post-create, post-delete, and post-restore refresh uses the default view filters instead of an empty object. No other changes needed — the service-layer logic already handles `default_view` correctly.

## Files to modify
- `app/(dashboard)/tickets/page.tsx` (line 30 only)

## Verification
1. Navigate to `/tickets` — should show today's tickets (any status) + Open/In Progress tickets from prior days
2. Create a new ticket — list should refresh and show the same filtered set (not all records)
3. Delete/restore a ticket — list should also refresh correctly with default view
