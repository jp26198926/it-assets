import { connectDB } from "@/lib/db/connection";
import { User as UserModel } from "@/lib/db/models/user";
import { UserStatus as UserStatusModel } from "@/lib/db/models/user-status";
import { Role as RoleModel } from "@/lib/db/models/role";
import { Department as DepartmentModel } from "@/lib/db/models/department";
import bcrypt from "bcryptjs";
import type { CreateUserInput, UpdateUserInput, UserFilters, User, UserStatus as UserStatusType, UserSelectItem } from "@/lib/types/user";

function toUser(u: Record<string, unknown>): User {
  const statusId = u.status_id as unknown as { _id: { toString(): string }; status: string };
  const roleId = u.role_id as unknown as { _id: { toString(): string }; name: string } | string;
  const deptId = u.department_id as unknown as { _id: { toString(): string }; name: string } | string | null;

  let role_id: string;
  let role_name: string | undefined;
  if (typeof roleId === "string") {
    role_id = roleId;
  } else {
    role_id = roleId._id.toString();
    role_name = roleId.name;
  }

  let department_id: string | null = null;
  let department_name: string | undefined;
  if (deptId && typeof deptId === "object" && "_id" in deptId) {
    department_id = deptId._id.toString();
    department_name = deptId.name;
  } else if (typeof deptId === "string") {
    department_id = deptId;
  }

  return {
    id: (u._id as { toString(): string }).toString(),
    first_name: u.first_name as string,
    last_name: u.last_name as string,
    email: u.email as string,
    department_id,
    department_name,
    role_id,
    role_name,
    status_id: statusId._id.toString(),
    status: statusId.status,
    is_verified: u.is_verified as boolean,
    email_verified_at: (u.email_verified_at as Date) ?? null,
    created_at: u.created_at as Date,
    created_by: u.created_by ? (u.created_by as { toString(): string }).toString() : null,
    updated_at: (u.updated_at as Date) ?? null,
    updated_by: u.updated_by ? (u.updated_by as { toString(): string }).toString() : null,
    deleted_at: (u.deleted_at as Date) ?? null,
  };
}

export async function getUserStatuses(): Promise<UserStatusType[]> {
  await connectDB();
  const statuses = await UserStatusModel.find().lean();
  return statuses.map((s) => ({
    id: s._id.toString(),
    status: s.status,
  }));
}

export async function getUserSelectOptions(): Promise<{ roles: UserSelectItem[]; departments: UserSelectItem[] }> {
  await connectDB();

  const [roles, departments] = await Promise.all([
    RoleModel.find({ deleted_at: null }).select("name").lean(),
    DepartmentModel.find({ deleted_at: null }).select("name").lean(),
  ]);

  return {
    roles: roles.map((r) => ({ id: (r._id as { toString(): string }).toString(), name: r.name })),
    departments: departments.map((d) => ({ id: (d._id as { toString(): string }).toString(), name: d.name })),
  };
}

export async function getUsers(filters?: UserFilters): Promise<User[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { first_name: { $regex: filters.search, $options: "i" } },
      { last_name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.first_name) {
    query.first_name = { $regex: filters.first_name, $options: "i" };
  }

  if (filters?.last_name) {
    query.last_name = { $regex: filters.last_name, $options: "i" };
  }

  if (filters?.email) {
    query.email = { $regex: filters.email, $options: "i" };
  }

  if (filters?.status) {
    const statusDoc = await UserStatusModel.findOne({ status: filters.status }).lean();
    if (statusDoc) {
      query.status_id = statusDoc._id;
    }
  }

  const users = await UserModel.find(query)
    .populate("status_id", "status")
    .populate("role_id", "name")
    .populate("department_id", "name")
    .sort({ created_at: -1 })
    .lean();

  return users.map((u) => toUser(u as unknown as Record<string, unknown>));
}

export async function getUserById(id: string): Promise<User | null> {
  await connectDB();

  const user = await UserModel.findById(id)
    .populate("status_id", "status")
    .populate("role_id", "name")
    .populate("department_id", "name")
    .lean();

  if (!user) return null;

  return toUser(user as unknown as Record<string, unknown>);
}

export async function createUser(data: CreateUserInput): Promise<User> {
  await connectDB();

  const activeStatus = await UserStatusModel.findOne({ status: "Active" }).lean();
  if (!activeStatus) throw new Error("Active status not found");

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await UserModel.create({
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password_hash: passwordHash,
    department_id: data.department_id || null,
    role_id: data.role_id,
    status_id: activeStatus._id,
  });

  const populated = await UserModel.findById(user._id)
    .populate("status_id", "status")
    .populate("role_id", "name")
    .populate("department_id", "name")
    .lean();

  if (!populated) throw new Error("Failed to create user");

  return toUser(populated as unknown as Record<string, unknown>);
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.first_name !== undefined) updateData.first_name = data.first_name;
  if (data.last_name !== undefined) updateData.last_name = data.last_name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.department_id !== undefined) updateData.department_id = data.department_id || null;
  if (data.role_id !== undefined) updateData.role_id = data.role_id;
  updateData.updated_at = new Date();

  const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("status_id", "status")
    .populate("role_id", "name")
    .populate("department_id", "name")
    .lean();

  if (!user) throw new Error("User not found");

  return toUser(user as unknown as Record<string, unknown>);
}

export async function deleteUser(id: string, reason?: string): Promise<void> {
  await connectDB();

  const deletedStatus = await UserStatusModel.findOne({ status: "Deleted" }).lean();
  await UserModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status_id: deletedStatus?._id,
    updated_at: new Date(),
  });
}

export async function changePassword(id: string, password: string): Promise<void> {
  await connectDB();

  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.findByIdAndUpdate(id, {
    password_hash: passwordHash,
    updated_at: new Date(),
  });
}

export async function restoreUser(id: string): Promise<void> {
  await connectDB();

  const activeStatus = await UserStatusModel.findOne({ status: "Active" }).lean();
  await UserModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status_id: activeStatus?._id,
    updated_at: new Date(),
  });
}
