import { connectDB } from "@/lib/db/connection";
import { TicketComment as TicketCommentModel } from "@/lib/db/models/ticket-comment";
import type { TicketComment, CreateTicketCommentInput } from "@/lib/types/ticket-comment";

function toTicketComment(d: Record<string, unknown>): TicketComment {
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
    ticket_id: (d.ticket_id as { toString(): string }).toString(),
    replied_to: d.replied_to ? (d.replied_to as { toString(): string }).toString() : null,
    message: d.message as string,
    attachments: (d.attachments as string[]) || [],
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

export async function createTicketComment(
  data: CreateTicketCommentInput,
  createdByUserId?: string | null
): Promise<TicketComment> {
  await connectDB();

  const comment = await TicketCommentModel.create({
    ticket_id: data.ticket_id,
    replied_to: data.replied_to || null,
    message: data.message,
    attachments: data.attachments || [],
    created_by: createdByUserId || null,
  });

  const populated = await TicketCommentModel.findById(comment._id)
    .populate("created_by", "first_name last_name")
    .lean();

  if (!populated) throw new Error("Failed to create comment");

  return toTicketComment(populated as unknown as Record<string, unknown>);
}

export async function getTicketCommentsByTicketId(
  ticketId: string,
  limit = 20,
  skip = 0
): Promise<TicketComment[]> {
  await connectDB();

  const comments = await TicketCommentModel.find({
    ticket_id: ticketId,
    deleted_at: null,
  })
    .populate("created_by", "first_name last_name")
    .sort({ created_at: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return comments.map((d) => toTicketComment(d as unknown as Record<string, unknown>));
}

export async function getTicketCommentCount(ticketId: string): Promise<number> {
  await connectDB();
  return TicketCommentModel.countDocuments({ ticket_id: ticketId, deleted_at: null });
}
