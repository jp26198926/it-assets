import { connectDB } from "@/lib/db/connection";
import { TicketStatusLog as TicketStatusLogModel } from "@/lib/db/models/ticket-status-log";
import type { TicketStatusLog } from "@/lib/types/ticket-status-log";

function toLog(d: Record<string, unknown>): TicketStatusLog {
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

  return {
    id: (d._id as { toString(): string }).toString(),
    ticket_id: (d.ticket_id as { toString(): string }).toString(),
    old_status: d.old_status as string,
    new_status: d.new_status as string,
    remarks: d.remarks as string,
    created_at: d.created_at as Date,
    created_by,
    created_by_name,
  };
}

export async function createTicketStatusLog(data: {
  ticket_id: string;
  old_status: string;
  new_status: string;
  remarks?: string;
  created_by?: string | null;
}): Promise<TicketStatusLog> {
  await connectDB();

  const log = await TicketStatusLogModel.create({
    ticket_id: data.ticket_id,
    old_status: data.old_status,
    new_status: data.new_status,
    remarks: data.remarks || "",
    created_by: data.created_by || null,
  });

  return toLog(log.toObject() as unknown as Record<string, unknown>);
}

export async function getLogsByTicketId(ticketId: string, limit = 5, skip = 0): Promise<TicketStatusLog[]> {
  await connectDB();

  const logs = await TicketStatusLogModel.find({ ticket_id: ticketId })
    .populate("created_by", "first_name last_name")
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return logs.map((d) => toLog(d as unknown as Record<string, unknown>));
}

export async function getTicketStatusLogCount(ticketId: string): Promise<number> {
  await connectDB();
  return TicketStatusLogModel.countDocuments({ ticket_id: ticketId });
}
