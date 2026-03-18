import { addDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "@constants/timezone";
import { DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE } from "@constants/reminders";
import type { IAgendaItem } from "@app-types/deadline-agenda.types";
import type {
  ICreateReminderPayload,
  ICreateFixedReminderPayload,
} from "@app-types/reminder.types";

/**
 * Builds the payload for creating a reminder from an agenda item.
 * Pure function, reusable from modal or other entry points.
 */
export function buildCreateReminderPayload(
  agendaItem: IAgendaItem,
  offsetDays: number,
): ICreateReminderPayload {
  return {
    type: "RELATIVE_TO_DEADLINE",
    processDeadlineId: agendaItem.id,
    offsetDays,
    timezone: APP_TIMEZONE,
    preferredHour: DEFAULT_REMINDER_HOUR,
    preferredMinute: DEFAULT_REMINDER_MINUTE,
    title: `Recordatorio: ${agendaItem.iue}`,
    body: `Plazo vence en ${Math.abs(offsetDays)} día(s): "${agendaItem.detectedText}"`,
    data: {
      screen: "ExpedienteDetail",
      params: { iue: agendaItem.iue },
    },
  };
}

/**
 * Builds a FIXED_DATE reminder payload for any expediente.
 * @param iue - IUE del expediente
 * @param remindAt - Fecha y hora del recordatorio
 * @param title - Título opcional (por defecto "Recordatorio: {iue}")
 * @param body - Descripción opcional
 */
export function buildCreateFixedReminderPayload(
  iue: string,
  remindAt: Date,
  title?: string | null,
  body?: string | null,
): ICreateFixedReminderPayload {
  // Interpretar la hora del picker como Uruguay (evita que el dispositivo en otra TZ sume 3h).
  // fromZonedTime: "YYYY-MM-DD HH:mm en Uruguay" → instante UTC correcto.
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${remindAt.getFullYear()}-${pad(remindAt.getMonth() + 1)}-${pad(remindAt.getDate())}T${pad(remindAt.getHours())}:${pad(remindAt.getMinutes())}:00`;
  const utcDate = fromZonedTime(dateStr, APP_TIMEZONE);
  const remindAtIso = utcDate.toISOString();

  return {
    type: "FIXED_DATE",
    remindAt: remindAtIso,
    expedienteIue: iue,
    timezone: APP_TIMEZONE,
    title: (title?.trim() || `Recordatorio: ${iue}`) || undefined,
    body: body?.trim() || undefined,
    data: {
      screen: "ExpedienteDetail",
      params: { iue },
    },
  };
}

/** Fecha por defecto para recordatorio: 7 días desde hoy a las 9:00. */
export function getDefaultReminderDate(): Date {
  const base = addDays(new Date(), 7);
  base.setHours(DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE, 0, 0);
  return base;
}

/** Fecha para un preset de días desde hoy. */
export function getReminderDateForPreset(daysFromNow: number): Date {
  const base = addDays(new Date(), daysFromNow);
  base.setHours(DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE, 0, 0);
  return base;
}
