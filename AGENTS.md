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

## View Modal — Audit Fields Standard
All view modals must display audit fields in a consistent layout. Place them in a second `grid grid-cols-2 gap-6` section below the main fields, separated by an `<hr />`.

**Left column** (always visible):
- Created At — `format(new Date(item.created_at), "MMMM dd, yyyy")`
- Created By — `item.created_by_name || "N/A"`

**Right column** (always visible):
- Last Updated — show date or "Never" if null
- Updated By — `item.updated_by_name || "N/A"`

**Deleted fields** (conditional — only show when `item.deleted_at` is truthy):
- Left column: Deleted At (with `text-rose-600`), Delete Reason (with `text-rose-600`, only if `deleted_reason` exists)
- Right column: Deleted By (with `text-rose-600`)

Example JSX structure:
```tsx
<div className="py-3"><hr /></div>
<div className="grid grid-cols-2 gap-6">
  <div className="space-y-4">
    {/* Created At */}
    {/* Created By */}
    {item.deleted_at && (
      <>
        {/* Deleted At — text-rose-600 */}
        {item.deleted_reason && {/* Delete Reason — text-rose-600 */})}
      </>
    )}
  </div>
  <div className="space-y-4">
    {/* Last Updated (or "Never") */}
    {/* Updated By */}
    {item.deleted_at && (
      <>
        {/* Deleted By — text-rose-600 */}
      </>
    )}
  </div>
</div>
```

## Modal — Scrollable Content Pattern
All modals (form and view) must support scrollable content when content exceeds the viewport height, while keeping the header and footer fixed.

Structure (header, scrollable content, and footer must be siblings):
```
DialogContent  flex flex-col max-h-[85vh]
  DialogHeader                          ← pinned top (bg-muted/50)
  <form/div>  flex-1 overflow-y-auto min-h-0  ← scrolls
    ...fields/content...
  </form/div>
  DialogFooter                          ← pinned bottom (bg-muted/50)
```

Apply these classes:
- **DialogContent**: `flex flex-col max-h-[85vh]`
- **DialogHeader**: `-mx-4 -mt-4 rounded-t-xl border-b bg-muted/50 p-4`
- **Content area** (form or div between DialogHeader and DialogFooter): `flex-1 overflow-y-auto min-h-0`
- **DialogFooter**: Keep default styling (already has `bg-muted/50`)

For form modals, the `DialogFooter` must be outside the `<form>` element. Add `id` to the form and `form="form-id"` to the submit button:
```tsx
<form id="asset-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
  {/* fields */}
</form>
<DialogFooter>
  <Button type="button" variant="outline" onClick={...}>Cancel</Button>
  <Button type="submit" form="asset-form">Save</Button>
</DialogFooter>
```

This ensures the header and footer remain pinned while only the middle content scrolls.

## Images — Use next/image
Always use `next/image` (`Image` component) instead of the HTML `<img>` tag. This provides automatic optimization (modern formats, lazy loading, responsive sizing). For external images (e.g., Cloudinary), use the `unoptimized` prop.

## SelectTrigger — Always use w-full
All `SelectTrigger` components in forms must include `className="w-full"` so dropdowns use the full width of their container. The default `SelectTrigger` is `w-fit`, which causes inconsistent sizing.

## Select Options — Always sorted A-Z
All dropdown option lists must be sorted alphabetically (A-Z). Sort at the database query level in the service layer using `.sort({ name: 1 })` (or equivalent field). For employee names, sort by last name then first name.

## Delete Confirmation — Always Include Reason
All delete confirmation modals must include an optional "Delete Reason" textarea field. The `onConfirm` callback must accept a `reason: string` parameter and pass it to the delete service function.

**DeleteConfirmModal** pattern:
- `onConfirm: (reason: string) => void` — callback receives the reason
- Textarea for optional delete reason
- Reset reason on cancel

**Page handler** pattern:
```tsx
const handleDeleteConfirm = async (reason: string) => {
  if (deleteItem) {
    await deleteItem(deleteItem.id, reason || undefined);
  }
};
```
