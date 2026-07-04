import mongoose, { Schema, Document, Types } from "mongoose";
import { BaseAuditSchemaDefinition, BaseAuditFields } from "../base-schema";

export interface IAgendaItem {
  topic: string;
  description: string | null;
  presenter: string | null;
  duration_minutes: number | null;
  notes: string | null;
}

export interface IAttendee {
  employee_id: Types.ObjectId;
  attendance_status:
    | "Pending"
    | "Accepted"
    | "Declined"
    | "Tentative"
    | "Attended"
    | "Absent";
  notes: string | null;
}

export interface IRecurrence {
  frequency: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Yearly";
  interval: number;
  end_type: "Never" | "After" | "On Date";
  end_after: number | null;
  end_date: Date | null;
  days_of_week: number[] | null;
}

export interface IMeeting extends Document, BaseAuditFields {
  meeting_no: number;
  title: string;
  description: string | null;
  meeting_type_id: Types.ObjectId | null;
  scheduled_date: Date;
  start_time: string;
  end_time: string | null;
  location: string | null;
  meeting_link: string | null;
  platform: string | null;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "Deleted";
  notes: string | null;
  agenda_items: IAgendaItem[];
  attendees: IAttendee[];
  attachments: string[];
  is_recurring: boolean;
  recurrence: IRecurrence | null;
  parent_meeting_id: Types.ObjectId | null;
}

const AgendaItemSchema = new Schema<IAgendaItem>(
  {
    topic: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    presenter: {
      type: String,
      default: null,
    },
    duration_minutes: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

const AttendeeSchema = new Schema<IAttendee>(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    attendance_status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Tentative", "Attended", "Absent"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

const RecurrenceSchema = new Schema<IRecurrence>(
  {
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Biweekly", "Monthly", "Yearly"],
      required: true,
    },
    interval: {
      type: Number,
      default: 1,
    },
    end_type: {
      type: String,
      enum: ["Never", "After", "On Date"],
      default: "Never",
    },
    end_after: {
      type: Number,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
    days_of_week: {
      type: [Number],
      default: null,
    },
  },
  { _id: false }
);

const MeetingSchema = new Schema<IMeeting>({
  meeting_no: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  meeting_type_id: {
    type: Schema.Types.ObjectId,
    ref: "MeetingType",
    default: null,
  },
  scheduled_date: {
    type: Date,
    required: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  meeting_link: {
    type: String,
    default: null,
  },
  platform: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["Scheduled", "In Progress", "Completed", "Cancelled", "Deleted"],
    default: "Scheduled",
  },
  notes: {
    type: String,
    default: null,
  },
  agenda_items: {
    type: [AgendaItemSchema],
    default: [],
  },
  attendees: {
    type: [AttendeeSchema],
    default: [],
  },
  attachments: {
    type: [String],
    default: [],
  },
  is_recurring: {
    type: Boolean,
    default: false,
  },
  recurrence: {
    type: RecurrenceSchema,
    default: null,
  },
  parent_meeting_id: {
    type: Schema.Types.ObjectId,
    ref: "Meeting",
    default: null,
  },
  ...BaseAuditSchemaDefinition,
});

MeetingSchema.index({ meeting_no: 1 }, { unique: true });
MeetingSchema.index({ status: 1 });
MeetingSchema.index({ meeting_type_id: 1 });
MeetingSchema.index({ scheduled_date: 1 });
MeetingSchema.index({ parent_meeting_id: 1 });
MeetingSchema.index({ created_at: -1 });

export const Meeting =
  mongoose.models.Meeting ||
  mongoose.model<IMeeting>("Meeting", MeetingSchema, "meetings");
