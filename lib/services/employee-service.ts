import { connectDB } from "@/lib/db/connection";
import { Employee as EmployeeModel } from "@/lib/db/models/employee";
import { Department as DepartmentModel } from "@/lib/db/models/department";
import type { CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters, Employee } from "@/lib/types/employee";

function toEmployee(e: Record<string, unknown>): Employee {
  const deptId = e.department_id as unknown as
    | { _id: { toString(): string }; name: string }
    | string
    | null;

  let department_id: string | null = null;
  let department_name: string | undefined;
  if (deptId && typeof deptId === "object" && "_id" in deptId) {
    department_id = deptId._id.toString();
    department_name = deptId.name;
  } else if (typeof deptId === "string") {
    department_id = deptId;
  }

  return {
    id: (e._id as { toString(): string }).toString(),
    emp_no: (e.emp_no as string) ?? null,
    firstname: e.firstname as string,
    middlename: (e.middlename as string) ?? null,
    lastname: e.lastname as string,
    email: (e.email as string) ?? null,
    contact_no: (e.contact_no as string) ?? null,
    department_id,
    department_name,
    status: e.status as "Active" | "Deleted",
    created_at: e.created_at as Date,
    created_by: e.created_by ? (e.created_by as { toString(): string }).toString() : null,
    updated_at: (e.updated_at as Date) ?? null,
    updated_by: e.updated_by ? (e.updated_by as { toString(): string }).toString() : null,
    deleted_at: (e.deleted_at as Date) ?? null,
  };
}

export async function getEmployeeSelectOptions(): Promise<{ departments: { id: string; name: string }[] }> {
  await connectDB();

  const departments = await DepartmentModel.find({ deleted_at: null }).select("name").lean();

  return {
    departments: departments.map((d) => ({
      id: (d._id as { toString(): string }).toString(),
      name: d.name,
    })),
  };
}

export async function getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { emp_no: { $regex: filters.search, $options: "i" } },
      { firstname: { $regex: filters.search, $options: "i" } },
      { middlename: { $regex: filters.search, $options: "i" } },
      { lastname: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { contact_no: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.emp_no) {
    query.emp_no = { $regex: filters.emp_no, $options: "i" };
  }

  if (filters?.firstname) {
    query.firstname = { $regex: filters.firstname, $options: "i" };
  }

  if (filters?.middlename) {
    query.middlename = { $regex: filters.middlename, $options: "i" };
  }

  if (filters?.lastname) {
    query.lastname = { $regex: filters.lastname, $options: "i" };
  }

  if (filters?.email) {
    query.email = { $regex: filters.email, $options: "i" };
  }

  if (filters?.contact_no) {
    query.contact_no = { $regex: filters.contact_no, $options: "i" };
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  const employees = await EmployeeModel.find(query)
    .populate("department_id", "name")
    .sort({ created_at: -1 })
    .lean();

  return employees.map((e) => toEmployee(e as unknown as Record<string, unknown>));
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  await connectDB();

  const employee = await EmployeeModel.findById(id)
    .populate("department_id", "name")
    .lean();

  if (!employee) return null;

  return toEmployee(employee as unknown as Record<string, unknown>);
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
  await connectDB();

  const employee = await EmployeeModel.create({
    emp_no: data.emp_no || null,
    firstname: data.firstname,
    middlename: data.middlename || null,
    lastname: data.lastname,
    email: data.email || null,
    contact_no: data.contact_no || null,
    department_id: data.department_id || null,
    status: "Active",
  });

  const created = await EmployeeModel.findById(employee._id)
    .populate("department_id", "name")
    .lean();

  if (!created) throw new Error("Failed to create employee");

  return toEmployee(created as unknown as Record<string, unknown>);
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput): Promise<Employee> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.emp_no !== undefined) updateData.emp_no = data.emp_no || null;
  if (data.firstname !== undefined) updateData.firstname = data.firstname;
  if (data.middlename !== undefined) updateData.middlename = data.middlename || null;
  if (data.lastname !== undefined) updateData.lastname = data.lastname;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.contact_no !== undefined) updateData.contact_no = data.contact_no || null;
  if (data.department_id !== undefined) updateData.department_id = data.department_id || null;
  updateData.updated_at = new Date();

  const employee = await EmployeeModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("department_id", "name")
    .lean();

  if (!employee) throw new Error("Employee not found");

  return toEmployee(employee as unknown as Record<string, unknown>);
}

export async function deleteEmployee(id: string, reason?: string): Promise<void> {
  await connectDB();

  await EmployeeModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreEmployee(id: string): Promise<void> {
  await connectDB();

  await EmployeeModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}
