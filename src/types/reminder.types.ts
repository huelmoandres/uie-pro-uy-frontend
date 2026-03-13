/**
 * Recordatorios — interfaces que espejan los DTOs del backend.
 */

export type ReminderType = "FIXED_DATE" | "RELATIVE_TO_DEADLINE";
export type ReminderStatus = "SCHEDULED" | "SENT" | "CANCELLED" | "FAILED";

export interface IReminder {
  id: string;
  userId: string;
  expedienteId?: string | null;
  processDeadlineId?: string | null;
  type: ReminderType;
  offsetDays?: number | null;
  remindAt: string;
  status: ReminderStatus;
  timezone: string;
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown> | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Payload para recordatorio relativo a un plazo (solo desde Agenda). */
export interface ICreateRelativeReminderPayload {
  type: "RELATIVE_TO_DEADLINE";
  processDeadlineId: string;
  offsetDays: number;
  timezone: string;
  preferredHour?: number;
  preferredMinute?: number;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

/** Payload para recordatorio con fecha fija (cualquier expediente). */
export interface ICreateFixedReminderPayload {
  type: "FIXED_DATE";
  remindAt: string; // ISO 8601
  expedienteIue: string;
  timezone: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export type ICreateReminderPayload =
  | ICreateRelativeReminderPayload
  | ICreateFixedReminderPayload;

export interface IRemindersListResponse {
  data: IReminder[];
  total: number;
}

export interface IRemindersQuery {
  status?: ReminderStatus;
  page?: number;
  limit?: number;
}
