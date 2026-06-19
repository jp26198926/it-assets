<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules

## API-Ready
Every CRUD page in this project must include REST API routes alongside the UI. For each entity (e.g., permissions, roles), create:
- `app/api/<entity>/route.ts` — GET (list with filters) + POST (create)
- `app/api/<entity>/[id]/route.ts` — GET (single) + PUT (update) + DELETE (soft-delete)
- `app/api/<entity>/[id]/restore/route.ts` — POST (restore)
- `app/api/<entity>/statuses/route.ts` — GET (list statuses)

Use `apiSuccess()` and `apiError()` from `@/lib/services/api-helpers` for consistent responses.

## Entity Pattern (CRUD Pages)
**All new pages must follow this pattern.** Each entity follows this file structure:
- `lib/types/<entity>.ts` — TypeScript interfaces (Entity, CreateInput, UpdateInput, Filters, etc.)
- `lib/db/models/<entity>.ts` — Mongoose schema and model
- `lib/services/<entity>-service.ts` — Database operations (CRUD, filters, soft-delete)
- `lib/actions/<entity>-actions.ts` — Server actions (`"use server"` wrappers)
- `app/(dashboard)/<entity>/page.tsx` — Client page component
- `components/data-table/<entity>-data-table.tsx` — TanStack Table with desktop + mobile views
- `components/data-table/<entity>-data-table-columns.tsx` — Column definitions with actions dropdown
- `components/data-table/<entity>-data-table-toolbar.tsx` — Search, filters, export buttons
- `components/modals/<entity>-form-modal.tsx` — Create/Edit dialog
- `components/modals/<entity>-view-modal.tsx` — Read-only detail dialog
- `components/modals/delete-confirm-modal.tsx` — Shared soft-delete confirmation

## Embedded Subdocuments
When an entity's child data is always accessed through the parent (e.g., role-permissions), embed it as an array subdocument in the parent schema instead of a separate collection. Use `$push` / `$pull` for add/remove, and manual deduplication (not `$addToSet`, which compares `_id` on subdocs).

## Dev Server
After modifying server actions or services, restart the dev server to pick up changes: `Ctrl+C` then `npm run dev`.
