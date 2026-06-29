import { connectDB } from "@/lib/db/connection";
import { Ticket as TicketModel } from "@/lib/db/models/ticket";
import { TicketCategory as TicketCategoryModel } from "@/lib/db/models/ticket-category";
import { Department as DepartmentModel } from "@/lib/db/models/department";
import { Counter as CounterModel } from "@/lib/db/models/counter";
import { User as UserModel } from "@/lib/db/models/user";
import { Role as RoleModel } from "@/lib/db/models/role";
import { Asset as AssetModel } from "@/lib/db/models/asset";
import { getMailSettings } from "./mail-service";
import { getAppName } from "./application-service";
import { createTicketStatusLog } from "./ticket-status-log-service";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { headers } from "next/headers";
import type { CreateTicketInput, UpdateTicketInput, TicketFilters, Ticket } from "@/lib/types/ticket";

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const protocol = h.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

function toTicket(d: Record<string, unknown>): Ticket {
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

  const categoryId = d.category_id as unknown as { _id: { toString(): string }; name: string } | string;
  let category_id: string;
  let category_name: string | undefined;
  if (typeof categoryId === "string") {
    category_id = categoryId;
  } else {
    category_id = categoryId._id.toString();
    category_name = categoryId.name;
  }

  const departmentId = d.department_id as unknown as { _id: { toString(): string }; name: string } | string | null;
  let department_id: string | null = null;
  let department_name: string | undefined;
  if (departmentId && typeof departmentId === "object" && "_id" in departmentId) {
    department_id = departmentId._id.toString();
    department_name = departmentId.name;
  } else if (typeof departmentId === "string") {
    department_id = departmentId;
  }

  const assetId = d.asset_id as unknown as { _id: { toString(): string }; barcode?: string; item_name?: string } | string | null;
  let asset_id: string | null = null;
  let asset_name: string | undefined;
  if (assetId && typeof assetId === "object" && "_id" in assetId) {
    asset_id = assetId._id.toString();
    asset_name = assetId.barcode || assetId.item_name;
  } else if (typeof assetId === "string") {
    asset_id = assetId;
  }

  const assignedToVal = d.assigned_to as unknown as { _id: { toString(): string }; first_name: string; last_name: string } | string | null;
  let assigned_to: string | null = null;
  let assigned_to_name: string | undefined;
  if (assignedToVal && typeof assignedToVal === "object" && "_id" in assignedToVal) {
    assigned_to = assignedToVal._id.toString();
    assigned_to_name = `${assignedToVal.first_name} ${assignedToVal.last_name}`.trim();
  } else if (typeof assignedToVal === "string") {
    assigned_to = assignedToVal;
  }

  const requestorVal = d.requestor_id as unknown as { _id: { toString(): string }; first_name: string; last_name: string } | string | null;
  let requestor_id: string | null = null;
  let requestor_name: string | undefined;
  if (requestorVal && typeof requestorVal === "object" && "_id" in requestorVal) {
    requestor_id = requestorVal._id.toString();
    requestor_name = `${requestorVal.first_name} ${requestorVal.last_name}`.trim();
  } else if (typeof requestorVal === "string") {
    requestor_id = requestorVal;
  }

  return {
    id: (d._id as { toString(): string }).toString(),
    ticket_no: d.ticket_no as string,
    name: d.name as string,
    email: d.email as string,
    requestor_id,
    requestor_name,
    title: d.title as string,
    description: d.description as string,
    category_id,
    category_name,
    department_id,
    department_name,
    priority: d.priority as "Low" | "Medium" | "High" | "Critical",
    asset_id,
    asset_name,
    asset_status: (d.asset_status as string) ?? null,
    assigned_to,
    assigned_to_name,
    attachments: (d.attachments as string[]) || [],
    status: d.status as "Open" | "In Progress" | "Resolved" | "Closed" | "Deleted",
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

async function generateTicketNo(): Promise<string> {
  await connectDB();

  const counter = await CounterModel.findOneAndUpdate(
    { name: "ticket_no" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  const seq = (counter as unknown as { seq: number }).seq;
  return `TK-${String(seq).padStart(6, "0")}`;
}

function generateRandomPassword(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendWelcomeEmail(email: string, password: string): Promise<void> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[TICKET] Auto-registered user - Email: ${email}, Password: ${password}`);
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

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: email,
    subject: `Welcome to ${appName} - Your Account Has Been Created`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Welcome!</h2>
          <p style="color: #475569; line-height: 1.6;">
            An account has been created for you on <strong>${appName}</strong> because a support ticket was submitted using your email address.
          </p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            You can now log in using these credentials. Please change your password after your first login for security.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            If you did not expect this email, please disregard it.
          </p>
        </div>
      </div>
    `,
  });
}

async function sendRequestorEmail(
  ticket_no: string,
  title: string,
  priority: string,
  email: string,
  ticketId: string,
  baseUrl: string
): Promise<void> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[TICKET] Requestor email - To: ${email}, Ticket: ${ticket_no}`);
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

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: email,
    subject: `[${ticket_no}] Your Support Ticket Has Been Created`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Ticket Created</h2>
          <p style="color: #475569; line-height: 1.6;">
            Your support ticket has been successfully created. Here are the details:
          </p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Ticket No:</strong> ${ticket_no}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Priority:</strong> ${priority}</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Our team will review your ticket and get back to you as soon as possible.
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

async function sendAssigneeEmail(
  ticket_no: string,
  title: string,
  priority: string,
  assigneeEmail: string,
  requestorName: string,
  ticketId: string,
  baseUrl: string
): Promise<void> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[TICKET] Assignee email - To: ${assigneeEmail}, Ticket: ${ticket_no}`);
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

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: assigneeEmail,
    subject: `[${ticket_no}] New Ticket Assigned to You`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Ticket Assigned to You</h2>
          <p style="color: #475569; line-height: 1.6;">
            A new support ticket has been assigned to you. Here are the details:
          </p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Ticket No:</strong> ${ticket_no}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Priority:</strong> ${priority}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Requestor:</strong> ${requestorName}</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Please review and address this ticket promptly.
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

async function sendTicketUpdatedEmail(
  ticket_no: string,
  title: string,
  email: string,
  updatedBy: string,
  changes: string[],
  ticketId: string,
  baseUrl: string
): Promise<void> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[TICKET] Update email - To: ${email}, Ticket: ${ticket_no}, Changes: ${changes.join(", ")}`);
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

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: email,
    subject: `[${ticket_no}] Your Ticket Has Been Updated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Ticket Updated</h2>
          <p style="color: #475569; line-height: 1.6;">
            Your support ticket <strong>${ticket_no}</strong> has been updated by <strong>${updatedBy}</strong>.
          </p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Ticket No:</strong> ${ticket_no}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Changes:</strong> ${changes.join(", ")}</p>
          </div>
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

async function sendTicketStatusChangedEmail(
  ticket_no: string,
  title: string,
  email: string,
  oldStatus: string,
  newStatus: string,
  updatedBy: string,
  ticketId: string,
  baseUrl: string
): Promise<void> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[TICKET] Status change email - To: ${email}, Ticket: ${ticket_no}, Status: ${oldStatus} → ${newStatus}`);
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

  const statusColors: Record<string, string> = {
    Open: "#1d4ed8",
    "In Progress": "#b45309",
    Resolved: "#059669",
    Closed: "#475569",
  };

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: email,
    subject: `[${ticket_no}] Ticket Status Changed: ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Ticket Status Changed</h2>
          <p style="color: #475569; line-height: 1.6;">
            The status of your support ticket <strong>${ticket_no}</strong> has been updated by <strong>${updatedBy}</strong>.
          </p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Ticket No:</strong> ${ticket_no}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 5px 0; color: #475569;">
              <strong>Status:</strong>
              <span style="color: ${statusColors[oldStatus] || "#475569"}">${oldStatus}</span>
              →
              <span style="color: ${statusColors[newStatus] || "#475569"}; font-weight: bold;">${newStatus}</span>
            </p>
          </div>
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

async function sendNewAssigneeEmail(
  ticket_no: string,
  title: string,
  priority: string,
  assigneeEmail: string,
  requestorName: string,
  assignedBy: string,
  ticketId: string,
  baseUrl: string
): Promise<void> {
  const settings = await getMailSettings();

  if (!settings.smtp_host) {
    console.log(`[TICKET] New assignee email - To: ${assigneeEmail}, Ticket: ${ticket_no}`);
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

  await transporter.sendMail({
    from: `"${settings.sender_name || appName}" <${settings.smtp_from}>`,
    to: assigneeEmail,
    subject: `[${ticket_no}] Ticket Assigned to You`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${appName}</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1f36; margin-top: 0;">Ticket Assigned to You</h2>
          <p style="color: #475569; line-height: 1.6;">
            A support ticket has been assigned to you by <strong>${assignedBy}</strong>.
          </p>
          <div style="background: #f0f4f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #475569;"><strong>Ticket No:</strong> ${ticket_no}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Priority:</strong> ${priority}</p>
            <p style="margin: 5px 0; color: #475569;"><strong>Requestor:</strong> ${requestorName}</p>
          </div>
          <p style="color: #475569; line-height: 1.6;">
            Please review and address this ticket promptly.
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

async function resolveRequestorId(email: string): Promise<string | null> {
  await connectDB();

  const existingUser = await UserModel.findOne({ email }).lean();
  if (existingUser) {
    return (existingUser._id as { toString(): string }).toString();
  }

  const viewerRole = await RoleModel.findOne({ name: "Viewer" }).lean();
  if (!viewerRole) {
    throw new Error("Viewer role not found for auto-registration");
  }

  const emailPrefix = email.split("@")[0];
  const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  const password = generateRandomPassword();
  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    first_name: firstName,
    last_name: " ",
    email,
    password_hash: passwordHash,
    role_id: viewerRole._id,
    status: "Active",
    is_verified: true,
    email_verified_at: new Date(),
  });

  await sendWelcomeEmail(email, password);

  return (newUser._id as { toString(): string }).toString();
}

async function enrichTicket(d: Record<string, unknown>): Promise<Ticket> {
  const ticket = toTicket(d);
  return ticket;
}

function extractId(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null && "_id" in val) {
    return (val as { _id: { toString(): string } })._id.toString();
  }
  return (val as { toString(): string }).toString();
}

function populateQuery(query: ReturnType<typeof TicketModel.find>) {
  return query
    .populate("category_id", "name")
    .populate("department_id", "name")
    .populate("asset_id", "barcode item_name")
    .populate("assigned_to", "first_name last_name")
    .populate("requestor_id", "first_name last_name")
    .populate("created_by", "first_name last_name")
    .populate("updated_by", "first_name last_name")
    .populate("deleted_by", "first_name last_name");
}

export async function getTickets(
  filters?: TicketFilters,
  user?: { userId: string; role: string } | null
): Promise<Ticket[]> {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (filters?.default_view) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    query.$or = [
      { status: { $in: ["Open", "In Progress"] } },
      { created_at: { $gte: todayStart, $lte: todayEnd } },
    ];
  }

  if (filters?.search) {
    query.$or = [
      { ticket_no: { $regex: filters.search, $options: "i" } },
      { title: { $regex: filters.search, $options: "i" } },
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  if (filters?.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters?.email) {
    query.email = { $regex: filters.email, $options: "i" };
  }

  if (filters?.ticket_no) {
    query.ticket_no = { $regex: filters.ticket_no, $options: "i" };
  }

  if (filters?.category_id) {
    query.category_id = filters.category_id;
  }

  if (filters?.priority) {
    query.priority = filters.priority;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.assigned_to) {
    query.assigned_to = filters.assigned_to;
  }

  if (filters?.department_id) {
    query.department_id = filters.department_id;
  }

  if (filters?.asset_id) {
    query.asset_id = filters.asset_id;
  }

  if (filters?.date_from || filters?.date_to) {
    query.created_at = {};
    if (filters.date_from) {
      query.created_at.$gte = new Date(filters.date_from);
    }
    if (filters.date_to) {
      const endDate = new Date(filters.date_to);
      endDate.setHours(23, 59, 59, 999);
      query.created_at.$lte = endDate;
    }
  }

  if (filters?.status_in && filters.status_in.length > 0) {
    query.status = { $in: filters.status_in };
  }

  if (user && user.role !== "Administrator") {
    if (user.role === "Viewer") {
      query.$and = query.$and || [];
      (query.$and as Record<string, unknown>[]).push({
        $or: [{ requestor_id: user.userId }, { created_by: user.userId }],
      });
    } else if (user.role === "Technician") {
      query.$and = query.$and || [];
      (query.$and as Record<string, unknown>[]).push({
        $or: [{ created_by: user.userId }, { assigned_to: user.userId }],
      });
    }
  }

  const tickets = await populateQuery(
    TicketModel.find(query).sort({ created_at: -1 })
  ).lean();

  return Promise.all(tickets.map((d) => enrichTicket(d as unknown as Record<string, unknown>)));
}

export async function getTicketById(
  id: string,
  user?: { userId: string; role: string } | null
): Promise<Ticket | null> {
  await connectDB();

  const ticket = await populateQuery(TicketModel.findById(id)).lean();

  if (!ticket) return null;

  if (user && user.role !== "Administrator") {
    const ticketData = ticket as unknown as Record<string, unknown>;
    const requestorId = extractId(ticketData.requestor_id);
    const createdBy = extractId(ticketData.created_by);
    const assignedTo = extractId(ticketData.assigned_to);

    if (user.role === "Viewer") {
      if (requestorId !== user.userId && createdBy !== user.userId) {
        return null;
      }
    } else if (user.role === "Technician") {
      if (createdBy !== user.userId && assignedTo !== user.userId) {
        return null;
      }
    }
  }

  return enrichTicket(ticket as unknown as Record<string, unknown>);
}

export async function createTicket(data: CreateTicketInput, createdByUserId?: string | null): Promise<Ticket> {
  await connectDB();

  const ticket_no = await generateTicketNo();
  const requestor_id = await resolveRequestorId(data.email);

  let asset_status: string | null = null;
  if (data.asset_id) {
    const asset = await AssetModel.findById(data.asset_id).lean();
    if (asset) {
      asset_status = (asset as unknown as { status: string }).status;
      await AssetModel.findByIdAndUpdate(data.asset_id, { status: "Repair" });
    }
  }

  const ticket = await TicketModel.create({
    ticket_no,
    name: data.name,
    email: data.email,
    requestor_id: requestor_id || null,
    title: data.title,
    description: data.description,
    category_id: data.category_id,
    department_id: data.department_id || null,
    priority: data.priority || "Low",
    asset_id: data.asset_id || null,
    asset_status,
    assigned_to: data.assigned_to || null,
    attachments: data.attachments || [],
    status: data.assigned_to ? "In Progress" : "Open",
    created_by: createdByUserId || null,
  });

  const created = await populateQuery(TicketModel.findById(ticket._id)).lean();

  if (!created) throw new Error("Failed to create ticket");

  const ticketData = enrichTicket(created as unknown as Record<string, unknown>);

  const baseUrl = await getBaseUrl();
  const ticketId = ticket.id;

  sendRequestorEmail(
    ticket_no,
    data.title,
    data.priority || "Low",
    data.email,
    ticketId,
    baseUrl
  ).catch(() => {});

  if (data.assigned_to) {
    const assignee = await UserModel.findById(data.assigned_to).lean();
    if (assignee) {
      const assigneeEmail = (assignee as unknown as { email: string }).email;
      sendAssigneeEmail(
        ticket_no,
        data.title,
        data.priority || "Low",
        assigneeEmail,
        data.name,
        ticketId,
        baseUrl
      ).catch(() => {});
    }
  }

  createTicketStatusLog({
    ticket_id: ticket.id,
    old_status: "New",
    new_status: ticket.status,
    remarks: "Ticket created",
    created_by: createdByUserId || null,
  }).catch(() => {});

  return ticketData;
}

export async function updateTicket(
  id: string,
  data: UpdateTicketInput,
  updatedByUserId?: string | null
): Promise<Ticket> {
  await connectDB();

  const oldTicket = await TicketModel.findById(id).lean();
  if (!oldTicket) throw new Error("Ticket not found");

  const oldStatus = oldTicket.status as string;
  const oldAssignedTo = oldTicket.assigned_to ? (oldTicket.assigned_to as { toString(): string }).toString() : null;
  const oldEmail = oldTicket.email as string;
  const oldTitle = oldTicket.title as string;
  const ticket_no = oldTicket.ticket_no as string;

  let updatedByName = "System";
  if (updatedByUserId) {
    const updater = await UserModel.findById(updatedByUserId).lean();
    if (updater) {
      updatedByName = `${(updater as unknown as { first_name: string }).first_name} ${(updater as unknown as { last_name: string }).last_name}`.trim();
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category_id !== undefined) updateData.category_id = data.category_id;
  if (data.department_id !== undefined) updateData.department_id = data.department_id || null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.asset_id !== undefined) updateData.asset_id = data.asset_id || null;
  if (data.assigned_to !== undefined) updateData.assigned_to = data.assigned_to || null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.attachments !== undefined) updateData.attachments = data.attachments;
  if (updatedByUserId) updateData.updated_by = updatedByUserId;
  updateData.updated_at = new Date();

  if (data.email) {
    const requestor_id = await resolveRequestorId(data.email);
    updateData.requestor_id = requestor_id || null;
  }

  const ticket = await populateQuery(
    TicketModel.findByIdAndUpdate(id, updateData, { new: true })
  ).lean();

  if (!ticket) throw new Error("Ticket not found");

  const ticketData = enrichTicket(ticket as unknown as Record<string, unknown>);

  const newStatus = data.status !== undefined ? data.status : oldStatus;
  const newAssignedTo = data.assigned_to !== undefined ? (data.assigned_to || null) : oldAssignedTo;
  const statusChanged = data.status !== undefined && data.status !== oldStatus;
  const assigneeChanged = data.assigned_to !== undefined && newAssignedTo !== oldAssignedTo;

  const requestorEmail = data.email || oldEmail;
  const ticketTitle = data.title || oldTitle;
  const ticketPriority = data.priority || (oldTicket.priority as string);

  const baseUrl = await getBaseUrl();

  if (statusChanged) {
    if (
      (newStatus === "Resolved" || newStatus === "Closed") &&
      oldTicket.asset_id &&
      oldTicket.asset_status
    ) {
      await AssetModel.findByIdAndUpdate(oldTicket.asset_id, {
        status: oldTicket.asset_status,
      });
    }

    sendTicketStatusChangedEmail(
      ticket_no,
      ticketTitle,
      requestorEmail,
      oldStatus,
      newStatus!,
      updatedByName,
      id,
      baseUrl
    ).catch(() => {});

    if (oldAssignedTo && updatedByUserId !== oldAssignedTo) {
      const technician = await UserModel.findById(oldAssignedTo).lean();
      if (technician) {
        const techEmail = (technician as unknown as { email: string }).email;
        sendTicketStatusChangedEmail(
          ticket_no,
          ticketTitle,
          techEmail,
          oldStatus,
          newStatus!,
          updatedByName,
          id,
          baseUrl
        ).catch(() => {});
      }
    }

    createTicketStatusLog({
      ticket_id: id,
      old_status: oldStatus,
      new_status: newStatus!,
      remarks: `Status changed from ${oldStatus} to ${newStatus}`,
      created_by: updatedByUserId || null,
    }).catch(() => {});
  } else {
    const changes: string[] = [];
    if (data.name !== undefined) changes.push("Name");
    if (data.email !== undefined) changes.push("Email");
    if (data.title !== undefined) changes.push("Title");
    if (data.description !== undefined) changes.push("Description");
    if (data.category_id !== undefined) changes.push("Category");
    if (data.department_id !== undefined) changes.push("Department");
    if (data.priority !== undefined) changes.push("Priority");
    if (data.asset_id !== undefined) changes.push("Asset");
    if (data.attachments !== undefined) changes.push("Attachments");

    if (changes.length > 0) {
      sendTicketUpdatedEmail(
        ticket_no,
        ticketTitle,
        requestorEmail,
        updatedByName,
        changes,
        id,
        baseUrl
      ).catch(() => {});

      if (oldAssignedTo && updatedByUserId !== oldAssignedTo) {
        const technician = await UserModel.findById(oldAssignedTo).lean();
        if (technician) {
          const techEmail = (technician as unknown as { email: string }).email;
          sendTicketUpdatedEmail(
            ticket_no,
            ticketTitle,
            techEmail,
            updatedByName,
            changes,
            id,
            baseUrl
          ).catch(() => {});
        }
      }

      createTicketStatusLog({
        ticket_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        remarks: `Ticket updated: ${changes.join(", ")}`,
        created_by: updatedByUserId || null,
      }).catch(() => {});
    }
  }

  if (assigneeChanged) {
    let assigneeName: string | null = null;
    let assigneeEmail: string | null = null;

    if (newAssignedTo) {
      const assignee = await UserModel.findById(newAssignedTo).lean();
      if (assignee) {
        assigneeName = `${(assignee as unknown as { first_name: string }).first_name} ${(assignee as unknown as { last_name: string }).last_name}`.trim();
        assigneeEmail = (assignee as unknown as { email: string }).email;
      }
    }

    createTicketStatusLog({
      ticket_id: id,
      old_status: newStatus,
      new_status: newStatus,
      remarks: newAssignedTo
        ? `Assigned to ${assigneeName || "Unknown"}`
        : "Unassigned",
      created_by: updatedByUserId || null,
    }).catch(() => {});

    if (newAssignedTo && assigneeEmail) {
      const requestorName = data.name || oldTicket.name as string;
      sendNewAssigneeEmail(
        ticket_no,
        ticketTitle,
        ticketPriority,
        assigneeEmail,
        requestorName,
        updatedByName,
        id,
        baseUrl
      ).catch(() => {});
    }
  }

  return ticketData;
}

export async function deleteTicket(id: string, deletedByUserId?: string | null, reason?: string): Promise<void> {
  await connectDB();

  const oldTicket = await TicketModel.findById(id).lean();
  const oldStatus = oldTicket ? (oldTicket.status as string) : "Unknown";

  await TicketModel.findByIdAndUpdate(id, {
    deleted_at: new Date(),
    deleted_by: deletedByUserId || null,
    deleted_reason: reason || null,
    status: "Deleted",
    updated_at: new Date(),
  });

  createTicketStatusLog({
    ticket_id: id,
    old_status: oldStatus,
    new_status: "Deleted",
    remarks: reason ? `Ticket deleted: ${reason}` : "Ticket deleted",
    created_by: deletedByUserId || null,
  }).catch(() => {});
}

export async function restoreTicket(id: string): Promise<void> {
  await connectDB();

  const ticket = await TicketModel.findById(id).lean();
  const assignedTo = ticket?.assigned_to;
  const newStatus = assignedTo ? "In Progress" : "Open";

  await TicketModel.findByIdAndUpdate(id, {
    deleted_at: null,
    deleted_by: null,
    deleted_reason: null,
    status: newStatus,
    updated_at: new Date(),
  });

  createTicketStatusLog({
    ticket_id: id,
    old_status: "Deleted",
    new_status: newStatus,
    remarks: "Ticket restored",
  }).catch(() => {});
}

export async function getTicketSelectOptions(): Promise<{
  categories: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  assets: { id: string; barcode: string; itemName: string }[];
  users: { id: string; name: string }[];
}> {
  await connectDB();

  await import("@/lib/db/models/item");

  const assignableRoles = await RoleModel.find({ name: { $in: ["Administrator", "Technician"] }, deleted_at: null }).lean();
  const assignableRoleIds = assignableRoles.map((r) => r._id);

  const [categories, departments, rawAssets, users] = await Promise.all([
    TicketCategoryModel.find({ deleted_at: null, status: "Active" }).select("name").sort({ name: 1 }).lean(),
    DepartmentModel.find({ deleted_at: null, status: "Active" }).select("name").sort({ name: 1 }).lean(),
    AssetModel.find({ deleted_at: null }).populate("item_id", "name").sort({ barcode: 1 }).lean(),
    UserModel.find({ deleted_at: null, status: "Active", role_id: { $in: assignableRoleIds } }).select("first_name last_name").sort({ last_name: 1, first_name: 1 }).lean(),
  ]);

  return {
    categories: categories.map((c) => ({ id: (c._id as { toString(): string }).toString(), name: c.name })),
    departments: departments.map((d) => ({ id: (d._id as { toString(): string }).toString(), name: d.name })),
    assets: rawAssets.map((a) => {
      const item = a.item_id as unknown as { name?: string } | null;
      return {
        id: (a._id as { toString(): string }).toString(),
        barcode: a.barcode,
        itemName: item?.name ?? "Unknown Item",
      };
    }),
    users: users.map((u) => ({ id: (u._id as { toString(): string }).toString(), name: `${u.first_name} ${u.last_name}`.trim() })),
  };
}

export async function getActiveTicketCategories(): Promise<{ id: string; name: string }[]> {
  await connectDB();
  const categories = await TicketCategoryModel.find({ deleted_at: null, status: "Active" })
    .select("name")
    .sort({ name: 1 })
    .lean();
  return categories.map((c) => ({ id: (c._id as { toString(): string }).toString(), name: c.name }));
}
