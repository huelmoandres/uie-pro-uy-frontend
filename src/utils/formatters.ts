/**
 * Pure utility functions for formatting judicial data.
 * Uses date-fns y date-fns-tz con zona horaria America/Montevideo (Uruguay).
 * Todas las fechas de decretos, movimientos y expedientes son en hora Uruguay.
 * No side effects, fully testable.
 */
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { APP_TIMEZONE } from "@constants/timezone";

// ─── IUE ──────────────────────────────────────────────────────────────────────

/**
 * Validates that a string matches the judicial IUE format: "Sede-NroRegistro/Año"
 * Example: "2-5432/2023"
 */
export function isValidIue(iue: string): boolean {
  return /^\d+-\d+\/\d{4}$/.test(iue.trim());
}

/**
 * Normalizes an IUE string by trimming whitespace.
 */
export function normalizeIue(iue: string): string {
  return iue.trim().toUpperCase();
}

// ─── Dates (America/Montevideo) ───────────────────────────────────────────────

function parseDate(isoDate: string): Date | null {
  // Si no tiene Z ni offset (+/-HH:mm), asumir UTC (el backend guarda en UTC)
  let str = isoDate;
  if (!/Z|[+-]\d{2}:?\d{2}$/.test(str)) {
    str = str + "Z";
  }
  const date = parseISO(str);
  return isValid(date) ? date : null;
}

/**
 * Formatea una fecha ISO a "dd/MM/yyyy" en hora Uruguay (America/Montevideo).
 * Todas las fechas judiciales son en hora local Uruguay.
 */
export function formatDate(isoDate: string | Date | null | undefined): string {
  if (!isoDate) return "Sin fecha";
  const date = isoDate instanceof Date ? isoDate : parseDate(isoDate);
  if (!date) return "Fecha inválida";
  return formatInTimeZone(date, APP_TIMEZONE, "dd/MM/yyyy");
}

/**
 * Formatea fecha y hora para recordatorios en hora Uruguay.
 * Ejemplo: "12/03/2026 23:52"
 */
export function formatReminderDateTime(
  isoDate: string | Date | null | undefined,
): string {
  if (!isoDate) return "Sin fecha";
  const date = isoDate instanceof Date ? isoDate : parseDate(isoDate);
  if (!date) return "Fecha inválida";
  return formatInTimeZone(date, APP_TIMEZONE, "dd/MM/yyyy HH:mm");
}

/**
 * Formats an ISO date string to a human-readable relative time in Spanish.
 * Example: "hace 3 días", "en 2 días"
 */
export function formatRelativeDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "Sin sincronización";
  const date = parseDate(isoDate);
  if (!date) return "Fecha inválida";
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

/**
 * Formatea una fecha ISO a formato corto con nombre de mes en hora Uruguay.
 * Example: "15 mar. 2024"
 */
export function formatDateShort(
  isoDate: string | Date | null | undefined,
): string {
  if (!isoDate) return "Sin fecha";
  const date = isoDate instanceof Date ? isoDate : parseDate(isoDate as string);
  if (!date) return "Fecha inválida";
  return formatInTimeZone(date, APP_TIMEZONE, "d MMM yyyy", { locale: es });
}

/**
 * Obtiene el año de una fecha en hora Uruguay.
 * Útil para filtros por año en expedientes.
 */
export function getYearInAppTimezone(isoDate: string | Date): number {
  const date = isoDate instanceof Date ? isoDate : parseISO(isoDate);
  const str = formatInTimeZone(date, APP_TIMEZONE, "yyyy");
  return parseInt(str, 10);
}

/**
 * Obtiene el año actual en hora Uruguay (America/Montevideo).
 * Usar en lugar de new Date().getFullYear() para consistencia con el timezone de la app.
 */
export function getCurrentYearInAppTimezone(): number {
  const str = formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy");
  return parseInt(str, 10);
}

// ─── Movement types ───────────────────────────────────────────────────────────

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  DECRETO: "Decreto",
  SENTENCIA: "Sentencia",
  PROVEIDO: "Proveído",
  DILIGENCIA: "Diligencia",
};

/**
 * Returns a human-readable Spanish label for a movement type code.
 */
export function getMovementTypeLabel(tipo: string): string {
  return MOVEMENT_TYPE_LABELS[tipo.toUpperCase()] ?? tipo;
}

// ─── Reminder status ───────────────────────────────────────────────────────────

const REMINDER_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programado",
  SENT: "Enviado",
  CANCELLED: "Cancelado",
  FAILED: "Fallido",
};

/**
 * Returns a human-readable Spanish label for a reminder status.
 */
export function getReminderStatusLabel(status: string): string {
  return REMINDER_STATUS_LABELS[status] ?? status;
}

// ─── HTML Sanitization ────────────────────────────────────────────────────────

/**
 * Strips HTML tags from a string and decodes common HTML entities.
 * Used to sanitize caratula strings that may contain tags like <br>, &amp;, etc.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
