# IT Asset Management System

A full-stack IT asset management system built with Next.js, MongoDB, and Tailwind CSS. Features role-based authorization, JWT authentication, and a complete CRUD pattern for all entities.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JWT (jose) + HTTP-only cookies
- **UI:** Tailwind CSS + shadcn/ui components
- **Tables:** TanStack Table v8
- **State:** React hooks + Server Actions
- **Validation:** Mongoose schema validation

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (with replica set for transactions)

### Setup

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local

# Seed the database (creates initial pages, permissions, roles)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/it-assets?replicaSet=rs0
USERNAME=              # Fallback admin email (used when no users exist)
PASSWORD=              # Fallback admin password
JWT_SECRET=your-secret-key
JWT_EXPIRIES_IN=7d
```

### Initial Login

When no users exist in the database, the system uses a **fallback admin** account:
- Email: value from `USERNAME` env var
- Password: value from `PASSWORD` env var
- This admin has full access to all pages

After creating the first real user via registration, the fallback admin is no longer used.

---

## Project Structure

```
├── app/
│   ├── (auth)/              # Auth pages (login, register, forgot-password)
│   ├── (dashboard)/         # Dashboard pages (protected by AuthorizationProvider)
│   │   ├── layout.tsx       # Sidebar + header layout with auth provider
│   │   ├── departments/     # Example entity page
│   │   ├── users/
│   │   ├── roles/
│   │   └── ...
│   └── api/                 # REST API routes
│       ├── auth/            # Login, register, OTP, etc.
│       ├── departments/     # Entity API routes
│       └── ...
├── components/
│   ├── auth/                # PageGuard component
│   ├── data-table/          # TanStack Table components per entity
│   ├── layout/              # AppSidebar, Header
│   ├── modals/              # Form, view, delete modals per entity
│   ├── providers/           # AuthorizationProvider
│   └── ui/                  # shadcn/ui components
├── hooks/
│   └── use-authorization.ts # Client-side permission hook
├── lib/
│   ├── actions/             # Server actions ("use server")
│   ├── db/
│   │   ├── models/          # Mongoose schemas and models
│   │   ├── base-schema.ts   # Shared audit fields
│   │   └── connection.ts    # DB connection
│   ├── services/            # Business logic and DB operations
│   └── types/               # TypeScript interfaces per entity
└── scripts/                 # Database migration scripts
```

---

## Adding a New Entity (CRUD Module)

Every entity follows this exact pattern. Using "Category" as an example:

### Step 1: Types

**File: `lib/types/category.ts`**

```typescript
export interface Category {
  id: string;
  name: string;
  description: string | null;
  status: "Active" | "Deleted";
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
  deleted_at: Date | null;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface CategoryFilters {
  search?: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface CategoryAdvancedFilter {
  field: keyof Category;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "startsWith";
  value: string;
}
```

### Step 2: Mongoose Model

**File: `lib/db/models/category.ts`**

```typescript
import mongoose, { Schema, Document } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface ICategory extends Document, BaseAuditFields {
  name: string;
  description: string | null;
  status: "Active" | "Deleted";
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ["Active", "Deleted"],
    default: "Active",
  },
  ...BaseAuditSchemaDefinition,
});

CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ status: 1 });

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema, "categories");
```

> **Note:** Always spread `BaseAuditSchemaDefinition` to include audit fields (created_at, updated_at, deleted_at, etc.). Use soft-delete (`deleted_at`) instead of hard-delete.

### Step 3: Service

**File: `lib/services/category-service.ts`**

```typescript
import { connectDB } from "@/lib/db/connection";
import { Category as CategoryModel } from "@/lib/db/models/category";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryFilters, Category } from "@/lib/types/category";

function toCategory(c: Record<string, unknown>): Category {
  return {
    id: (c._id as { toString(): string }).toString(),
    name: c.name as string,
    description: (c.description as string) ?? null,
    status: c.status as "Active" | "Deleted",
    created_at: c.created_at as Date,
    created_by: c.created_by ? (c.created_by as { toString(): string }).toString() : null,
    updated_at: (c.updated_at as Date) ?? null,
    updated_by: c.updated_by ? (c.updated_by as { toString(): string }).toString() : null,
    deleted_at: (c.deleted_at as Date) ?? null,
  };
}

export async function getCategories(filters?: CategoryFilters): Promise<Category[]> {
  await connectDB();
  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }
  if (filters?.name) query.name = { $regex: filters.name, $options: "i" };
  if (filters?.status) query.status = filters.status;

  const categories = await CategoryModel.find(query).sort({ created_at: -1 }).lean();
  return categories.map((c) => toCategory(c as unknown as Record<string, unknown>));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  await connectDB();
  const category = await CategoryModel.findById(id).lean();
  if (!category) return null;
  return toCategory(category as unknown as Record<string, unknown>);
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  await connectDB();
  const category = await CategoryModel.create({
    name: data.name,
    description: data.description || null,
    status: "Active",
  });
  const created = await CategoryModel.findById(category._id).lean();
  if (!created) throw new Error("Failed to create category");
  return toCategory(created as unknown as Record<string, unknown>);
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
  await connectDB();
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  updateData.updated_at = new Date();

  const category = await CategoryModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  if (!category) throw new Error("Category not found");
  return toCategory(category as unknown as Record<string, unknown>);
}

export async function deleteCategory(id: string, reason?: string): Promise<void> {
  await connectDB();
  await CategoryModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreCategory(id: string): Promise<void> {
  await connectDB();
  await CategoryModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
```

### Step 4: Server Actions

**File: `lib/actions/category-actions.ts`**

```typescript
"use server";

import * as categoryService from "@/lib/services/category-service";
import type { CreateCategoryInput, UpdateCategoryInput, CategoryFilters, Category } from "@/lib/types/category";

export async function getCategories(filters?: CategoryFilters): Promise<Category[]> {
  return categoryService.getCategories(filters);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categoryService.getCategoryById(id);
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  return categoryService.createCategory(data);
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
  return categoryService.updateCategory(id, data);
}

export async function deleteCategory(id: string, reason?: string): Promise<void> {
  return categoryService.deleteCategory(id, reason);
}

export async function restoreCategory(id: string): Promise<void> {
  return categoryService.restoreCategory(id);
}
```

### Step 5: API Routes

**File: `app/api/categories/route.ts`** — List + Create

```typescript
import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as categoryService from "@/lib/services/category-service";
import type { CategoryFilters } from "@/lib/types/category";

export async function GET(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/categories", "Access");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const filters: CategoryFilters = {};
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("name")) filters.name = searchParams.get("name")!;
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;

    const hasFilters = Object.keys(filters).length > 0;
    const categories = await categoryService.getCategories(hasFilters ? filters : undefined);
    return apiSuccess(categories);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch categories");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await withPageAuth("/categories", "Add");
    if (error) return error;

    const body = await request.json();
    if (!body.name || typeof body.name !== "string") {
      return apiError("name is required", 400);
    }

    const category = await categoryService.createCategory({
      name: body.name,
      description: body.description,
    });
    return apiSuccess(category, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create category");
  }
}
```

**File: `app/api/categories/[id]/route.ts`** — Get + Update + Delete

```typescript
import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as categoryService from "@/lib/services/category-service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await withPageAuth("/categories", "Access");
    if (error) return error;

    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    if (!category) return apiError("Category not found", 404);
    return apiSuccess(category);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch category");
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await withPageAuth("/categories", "Edit");
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const category = await categoryService.updateCategory(id, {
      name: body.name,
      description: body.description,
    });
    return apiSuccess(category);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update category");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await withPageAuth("/categories", "Delete");
    if (error) return error;

    const { id } = await params;
    let reason: string | undefined;
    try { const body = await request.json(); reason = body.reason; } catch {}

    await categoryService.deleteCategory(id, reason);
    return apiSuccess({ message: "Category deleted" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to delete category");
  }
}
```

**File: `app/api/categories/[id]/restore/route.ts`** — Restore

```typescript
import { NextRequest } from "next/server";
import { apiSuccess, apiError, withPageAuth } from "@/lib/services/api-helpers";
import * as categoryService from "@/lib/services/category-service";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await withPageAuth("/categories", "Restore");
    if (error) return error;

    const { id } = await params;
    await categoryService.restoreCategory(id);
    return apiSuccess({ message: "Category restored" });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to restore category");
  }
}
```

### Step 6: UI Components

Create these files following the existing patterns in `components/data-table/` and `components/modals/`:

1. **`components/data-table/category-data-table.tsx`** — Table with desktop + mobile views
2. **`components/data-table/category-data-table-columns.tsx`** — Column definitions with actions dropdown
3. **`components/data-table/category-data-table-toolbar.tsx`** — Search, filters, export buttons
4. **`components/modals/category-form-modal.tsx`** — Create/Edit dialog
5. **`components/modals/category-view-modal.tsx`** — Read-only detail dialog

### Step 7: Dashboard Page

**File: `app/(dashboard)/categories/page.tsx`**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { CategoryDataTable } from "@/components/data-table/category-data-table";
import { createCategoryColumns } from "@/components/data-table/category-data-table-columns";
import { CategoryFormModal } from "@/components/modals/category-form-modal";
import { CategoryViewModal } from "@/components/modals/category-view-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PageGuard } from "@/components/auth/page-guard";
import { getCategories, createCategory, updateCategory, deleteCategory, restoreCategory } from "@/lib/actions/category-actions";
import type { Category, CreateCategoryInput, CategoryFilters } from "@/lib/types/category";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategoryItem, setDeleteCategoryItem] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<CategoryFilters>({});

  const loadData = useCallback(async (filters?: CategoryFilters) => {
    try {
      const data = await getCategories(filters);
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = () => { setEditCategory(null); setFormOpen(true); };
  const handleView = (cat: Category) => setViewCategory(cat);
  const handleEdit = (cat: Category) => { setEditCategory(cat); setFormOpen(true); };
  const handleDelete = (cat: Category) => setDeleteCategoryItem(cat);

  const handleRestore = async (cat: Category) => {
    try {
      await restoreCategory(cat.id);
      toast.success(`${cat.name} has been restored`);
      loadData(activeFilters);
    } catch { toast.error("Failed to restore category"); }
  };

  const handleFormSubmit = async (data: CreateCategoryInput) => {
    try {
      if (editCategory) {
        await updateCategory(editCategory.id, data);
        toast.success(`${data.name} has been updated`);
      } else {
        await createCategory(data);
        toast.success(`${data.name} has been added`);
      }
      loadData(activeFilters);
    } catch {
      toast.error("Failed to save category");
      throw new Error("Failed to save category");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteCategoryItem) {
      try {
        await deleteCategory(deleteCategoryItem.id);
        toast.success(`${deleteCategoryItem.name} has been deleted`);
        setDeleteCategoryItem(null);
        loadData(activeFilters);
      } catch { toast.error("Failed to delete category"); }
    }
  };

  const columns = createCategoryColumns(handleView, handleEdit, handleDelete, handleRestore);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Categories</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">Manage and organize categories</p>
          </div>
        </ScrollReveal>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#64748b]">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <PageGuard pagePath="/categories">
      <div className="space-y-4 sm:space-y-6">
        <ScrollReveal>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1f36] sm:text-3xl">Categories</h1>
            <p className="text-sm sm:text-base text-[#64748b] mt-1">Manage and organize categories</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <CategoryDataTable
            columns={columns}
            data={categories}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onAdd={handleAdd}
          />
        </ScrollReveal>

        <CategoryFormModal open={formOpen} onOpenChange={setFormOpen} category={editCategory} onSubmit={handleFormSubmit} />
        <CategoryViewModal open={!!viewCategory} onOpenChange={(open) => !open && setViewCategory(null)} category={viewCategory} />
        <DeleteConfirmModal open={!!deleteCategoryItem} onOpenChange={(open) => !open && setDeleteCategoryItem(null)} assetName={deleteCategoryItem?.name || ""} onConfirm={handleDeleteConfirm} />
      </div>
    </PageGuard>
  );
}
```

### Step 8: Register the Page in the Database

After creating the entity, add it to the `pages` collection so it appears in the sidebar and authorization system:

```typescript
// In lib/db/seed.ts or via the Pages admin page
{
  name: "Categories",
  path: "/categories",
  icon: "Tag",           // Must match a key in lib/icon-map.ts
  section: "Inventory",  // Optional grouping
  order: 5,
  status: "Active",
}
```

### Step 9: Assign Permissions

In the **Roles** admin page, edit a role and add permissions for the new page:
- **Access** — Allow entering the API route/page
- **View** — Show in sidebar
- **Add** — Show Add button
- **Edit** — Show Edit action
- **Delete** — Show Delete action
- **Restore** — Show Restore action
- **Export** — Show Export button
- **Print** — Show Print button

---

## Authorization System

### How It Works

1. **JWT Token** — Stored in HTTP-only cookie `auth-token`. Contains `roleId` for permission lookups.
2. **AuthorizationProvider** — Wraps the dashboard layout. Fetches user permissions on mount.
3. **PageGuard** — Wraps each page component. Checks `View` permission and redirects to `/dashboard` if unauthorized.
4. **API Routes** — Use `withPageAuth(pagePath, permission)` to check permissions before processing requests.
5. **Sidebar** — Filters menu items based on `View` permission. Child pages only show if the user has `View` permission for them.

### Permission Types

| Permission | Effect |
|---|---|
| Access | Allow entering the API route/page |
| View | Show page/menu in sidebar |
| Add | Show Add button |
| Edit | Show Edit action button |
| Delete | Show Delete action button |
| Restore | Show Restore action button |
| Export | Show Export button |
| Print | Show Print button |

### Adding Authorization to a New API Route

```typescript
import { withPageAuth } from "@/lib/services/api-helpers";

export async function GET(request: NextRequest) {
  const { error } = await withPageAuth("/your-page-path", "Access");
  if (error) return error;
  // ... your logic
}

export async function POST(request: NextRequest) {
  const { error } = await withPageAuth("/your-page-path", "Add");
  if (error) return error;
  // ... your logic
}
```

### Client-Side Permission Check

```typescript
import { useAuthorization } from "@/hooks/use-authorization";

function MyComponent() {
  const { hasPermission, isLoading } = useAuthorization();

  if (hasPermission("/departments", "Add")) {
    // Show Add button
  }

  if (hasPermission("/departments", "Export")) {
    // Show Export button
  }
}
```

### Page-Level Guard

```typescript
import { PageGuard } from "@/components/auth/page-guard";

export default function MyPage() {
  return (
    <PageGuard pagePath="/my-page">
      {/* Page content - only rendered if user has View permission */}
    </PageGuard>
  );
}
```

---

## Database Schema

### Base Audit Fields

All entities include these fields via `BaseAuditSchemaDefinition`:

```typescript
{
  created_at: Date,        // Auto-set on creation
  created_by: ObjectId,    // Reference to User who created
  updated_at: Date | null, // Updated on modification
  updated_by: ObjectId | null,
  deleted_at: Date | null, // Soft-delete timestamp
  deleted_by: ObjectId | null,
  deleted_reason: string | null,
}
```

### Key Collections

| Collection | Purpose |
|---|---|
| `users` | System users with role assignment |
| `roles` | Roles with embedded permissions array |
| `permissions` | Permission types (Access, View, Add, etc.) |
| `pages` | Page definitions (name, path, icon, parent) |
| `departments` | Company departments |
| `locations` | Physical locations |

### Role Permissions Structure

Roles store permissions as an embedded array of `{ page_id, permission_id }` pairs:

```typescript
{
  name: "Editor",
  permissions: [
    { page_id: ObjectId("..."), permission_id: ObjectId("...") },
    // ...
  ]
}
```

---

## Scripts

```bash
npm run db:seed              # Seed initial data
npm run db:migrate-pages     # Migrate pages collection
npm run db:migrate-permissions # Migrate permissions
npm run db:migrate-roles     # Migrate roles
npm run db:migrate-departments # Migrate departments
npm run db:migrate-users     # Migrate users
```

---

## Key Patterns

### Soft Delete
All entities use soft delete (`deleted_at` timestamp) instead of hard delete. This preserves data integrity and allows restoration.

### Server Actions
All database operations go through server actions in `lib/actions/`. These are `"use server"` functions that call the service layer.

### API Routes
Every entity has REST API routes alongside the UI. Use `apiSuccess()` and `apiError()` from `@/lib/services/api-helpers` for consistent responses.

### Service Layer
Services in `lib/services/` handle all database operations. They call `connectDB()` at the start and use the `toEntity()` helper to convert Mongoose documents to TypeScript interfaces.

### Type Conversions
Each service has a `toEntity()` function that converts Mongoose `ObjectId` references to strings:

```typescript
function toEntity(doc: Record<string, unknown>): Entity {
  return {
    id: (doc._id as { toString(): string }).toString(),
    // ... map fields
  };
}
```

---

## Dev Server

After modifying server actions or services, restart the dev server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```
