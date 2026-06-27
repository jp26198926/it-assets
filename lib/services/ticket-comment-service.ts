import { connectDB } from "@/lib/db/connection";
import { TicketComment as TicketCommentModel } from "@/lib/db/models/ticket-comment";
import { Ticket as TicketModel } from "@/lib/db/models/ticket";
import { User as UserModel } from "@/lib/db/models/user";
import { Role as RoleModel } from "@/lib/db/models/role";
import { getMailSettings } from "./mail-service";
import { getAppName } from "./application-service";
import nodemailer from "nodemailer";
import { headers } from "next/headers";
import type { TicketComment, CreateTicketCommentInput } from "@/lib/types/ticket-comment";

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const protocol = h.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

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

async function sendCommentNotificationEmail(
  ticket_no: string,
  title: string,
  recipientEmail: string,
  recipientName: string,
  commenterName: string,
  messagePreview: string,
  ticketId: string,
  baseUrl: string
): Promise<void> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[TICKET] Comment notification - To: ${recipientEmail}, Ticket: ${ticket_no}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_secure,
    auth: settings.smtp_user
      ? { user: settings.smtp_user, pass: settings.smtp_pass }
      : undefined,
  });

  const appName = await getAppName();
  const truncatedMessage = messagePreview.length > 200
    ? messagePreview.substring(0, 200) + "..."
    : messagePreview;

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: recipientEmail,
    subject: `[${ticket_no}] New Reply on Your Ticket`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">New Reply on Ticket</h2>
          <p style="color: #475569; line-height: 1.6;">
            <strong>${commenterName}</strong> has replied to support ticket <strong>${ticket_no}</strong>.
          </p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Ticket No:</strong> ${ticket_no}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Reply:</strong></p>
            <p style="margin: 5px 0; color: #475569; font-style: italic; padding-left: 10px; border-left: 3px solid #3b82f6;">${truncatedMessage}</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Please log in to view the full reply and respond if needed.
          </p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${baseUrl}/tickets/${ticketId}"
               style="display: inline-block; background: #3b82f6; color: white;
                      padding: 12px 24px; text-decoration: none; border-radius: 6px;
                      font-weight: bold; font-size: 14px;">
              View Ticket
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Sent at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `,
  });
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

  if (createdByUserId) {
    try {
      const ticket = await TicketModel.findById(data.ticket_id).lean();
      if (ticket) {
        const commenter = await UserModel.findById(createdByUserId).lean();
        if (commenter) {
          const commenterRole = await RoleModel.findById(
            (commenter as unknown as { role_id: { toString(): string } }).role_id
          ).lean();

          const roleName = (commenterRole as unknown as { name: string })?.name;
          const commenterName = `${(commenter as unknown as { first_name: string }).first_name} ${(commenter as unknown as { last_name: string }).last_name}`.trim();
          const ticket_no = (ticket as unknown as { ticket_no: string }).ticket_no;
          const title = (ticket as unknown as { title: string }).title;
          const ticketEmail = (ticket as unknown as { email: string }).email;
          const ticketName = (ticket as unknown as { name: string }).name;

          const htmlMessage = data.message.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

          const baseUrl = await getBaseUrl();

          if (roleName === "Administrator" || roleName === "Technician") {
            sendCommentNotificationEmail(
              ticket_no,
              title,
              ticketEmail,
              ticketName,
              commenterName,
              htmlMessage,
              data.ticket_id,
              baseUrl
            ).catch(() => {});
          } else {
            const assignedTo = (ticket as unknown as { assigned_to: { toString(): string } | null }).assigned_to;
            if (assignedTo) {
              const technician = await UserModel.findById(assignedTo).lean();
              if (technician) {
                const techEmail = (technician as unknown as { email: string }).email;
                const techName = `${(technician as unknown as { first_name: string }).first_name} ${(technician as unknown as { last_name: string }).last_name}`.trim();
                sendCommentNotificationEmail(
                  ticket_no,
                  title,
                  techEmail,
                  techName,
                  commenterName,
                  htmlMessage,
                  data.ticket_id,
                  baseUrl
                ).catch(() => {});
              }
            }
          }
        }
      }
    } catch {
      // Silent fail for notification
    }
  }

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
