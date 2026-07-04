import { connectDB } from "@/lib/db/connection";
import { MeetingType as MeetingTypeModel } from "@/lib/db/models/meeting-type";
import type {
  CreateMeetingTypeInput,
  UpdateMeetingTypeInput,
  MeetingTypeFilters,
  MeetingType as MeetingTypeType,
  MeetingTypeSelectOption,
} from "@/lib/types/meeting-type";

function toMeetingType(d: Record<string, unknown>): MeetingTypeType {
  const createdByVal = d.created_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let created_by: string | null = null;
  let created_by_name: string | undefined;
  if (createdByVal && typeof createdByVal === "object" && "_id" in createdByVal) {
    created_by = createdByVal._id.toString();
    created_by_name = `${createdByVal.first_name} ${createdByVal.last_name}`.trim();
  } else if (typeof createdByVal === "string") {
    created_by = createdByVal;
  }

  const updatedByVal = d.updated_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let updated_by: string | null = null;
  let updated_by_name: string | undefined;
  if (updatedByVal && typeof updatedByVal === "object" && "_id" in updatedByVal) {
    updated_by = updatedByVal._id.toString();
    updated_by_name = `${updatedByVal.first_name} ${updatedByVal.last_name}`.trim();
  } else if (typeof updatedByVal === "string") {
    updated_by = updatedByVal;
  }

  const deletedByVal = d.deleted_by as unknown as
    | { _id: { toString(): string }; first_name: string; last_name: string }
    | string
    | null;
  let deleted_by: string | null = null;
  let deleted_by_name: string | undefined;
  if (deletedByVal && typeof deletedByVal === "object" && "_id" in deletedByVal) {
    deleted_by = deletedByVal._id.toString();
    deleted_by_name = `${deletedByVal.first_name} ${deletedByVal.last_name}`.trim();
  } else if (typeof deletedByVal === "string") {
    deleted_by = deletedByVal;
  }

  return {
    id: (d._id as { toString(): string }).toString(),
    name: d.name as string,
    description: (d.description as string) ?? null,
    color: (d.color as string) ?? null,
    status: d.status as "Active" | "Deleted",
    created_at: d.created_at as Date,
    created_by,
    created_by_name,
    updated_at: (d.updated_at as Date) ?? null,
    updated_by,
    updated_by_name,
    deleted_at: (d.deleted_at as Date) ?? null,
    deleted_by,
    deleted_by_name,
    deleted_reason: (d.deleted_reason as string) ?? null,
  };
}

function populateChain(query:ReturnType<typeof MeetingTypeModel.find>|ReturnType<typeof MeetingTypeModel.findById>) {
  return query
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getMeetingTypes(
  filters?: MeetingTypeFilters
): Promise<MeetingTypeType[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
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

  const meetingTypes = await populateChain(
    MeetingTypeModel.find(query).sort({ name: 1 })
  ).lean();

  return meetingTypes.map((d: Record<string, unknown>) => toMeetingType(d));
}

export async function getMeetingTypeById(id: string): Promise<MeetingTypeType | null> {
  await connectDB();

  const meetingType = await populateChain(
    MeetingTypeModel.findById(id)
  ).lean();

  if (!meetingType) return null;

  return toMeetingType(meetingType as unknown as Record<string, unknown>);
}

export async function createMeetingType(
  data: CreateMeetingTypeInput
): Promise<MeetingTypeType> {
  await connectDB();

  const meetingType = await MeetingTypeModel.create({
    name: data.name,
    description: data.description || null,
    color: data.color || null,
    status: "Active",
  });

  const created = await populateChain(
    MeetingTypeModel.findById(meetingType._id)
  ).lean();

  if (!created) throw new Error("Failed to create meeting type");

  return toMeetingType(created as unknown as Record<string, unknown>);
}

export async function updateMeetingType(
  id: string,
  data: UpdateMeetingTypeInput
): Promise<MeetingTypeType> {
  await connectDB();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.color !== undefined) updateData.color = data.color || null;
  updateData.updated_at = new Date();

  const meetingType = await populateChain(
    MeetingTypeModel.findByIdAndUpdate(id, updateData, { new: true })
  ).lean();

  if (!meetingType) throw new Error("Meeting type not found");

  return toMeetingType(meetingType as unknown as Record<string, unknown>);
}

export async function deleteMeetingType(id: string, reason?: string): Promise<void> {
  await connectDB();

  await MeetingTypeModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });
}

export async function restoreMeetingType(id: string): Promise<void> {
  await connectDB();

  await MeetingTypeModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_reason: null,
    status: "Active",
    updated_at: new Date(),
  });
}

export async function getMeetingTypeSelectOptions(): Promise<MeetingTypeSelectOption[]> {
  await connectDB();

  const meetingTypes = await MeetingTypeModel.find({ deleted_at: null })
    .sort({ name: 1 })
    .lean();

  return meetingTypes.map((mt) => ({
    id: (mt._id as { toString(): string }).toString(),
    name: mt.name,
    color: mt.color,
  }));
}
