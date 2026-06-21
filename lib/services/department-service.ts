import { connectDB } from "@/lib/db/connection";
import { Department as DepartmentModel } from "@/lib/db/models/department";
import type { CreateDepartmentInput, UpdateDepartmentInput, DepartmentFilters, Department } from "@/lib/types/department";

function toDepartment(d: Record<string, unknown>): Department {
  return {
    id: (d._id as { toString(): string }).toString(),
    code: d.code as string,
    name: d.name as string,
    description: (d.description as string) ?? null,
    status: d.status as "Active" | "Deleted",
    created_at: d.created_at as Date,
    created_by: d.created_by ? (d.created_by as { toString(): string }).toString() : null,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by: d.updated_by ? (d.updated_by as { toString(): string }).toString() : null,
    deleted_at: (d.deleted_at as Date) ?? null,
  };
}

export async function getDepartments(filters?: DepartmentFilters): Promise<Department[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { code: { $regex: filters.search, $options: "i" } },
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.code) {
    query.code = { $regex: filters.code, $options: "i" };
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.description) {
    query.description = { $regex: filters.description, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const departments = await DepartmentModel.find(query)
    .sort({ created_at: -1 })
    .lean();

  return departments.map((d) => toDepartment(d as unknown as Record<string, unknown>));
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  await connectDB();

  const department = await DepartmentModel.findById(id).lean();

  if (!department) return null;

  return toDepartment(department as unknown as Record<string, unknown>);
}

export async function createDepartment(data: CreateDepartmentInput): Promise<Department> {
  await connectDB();

  const department = await DepartmentModel.create({
    code: data.code,
    name: data.name,
    description: data.description || null,
    status: "Active",
  });

  const created = await DepartmentModel.findById(department._id).lean();

  if (!created) throw new Error("Failed to create department");

  return toDepartment(created as unknown as Record<string, unknown>);
}

export async function updateDepartment(id: string, data: UpdateDepartmentInput): Promise<Department> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.code !== undefined) updateData.code = data.code;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  updateData.updated_at = new Date();

  const department = await DepartmentModel.findByIdAndUpdate(id, updateData, { new: true })
    .lean();

  if (!department) throw new Error("Department not found");

  return toDepartment(department as unknown as Record<string, unknown>);
}

export async function deleteDepartment(id: string, reason?: string): Promise<void> {
  await connectDB();

  await DepartmentModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreDepartment(id: string): Promise<void> {
  await connectDB();

  await DepartmentModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
