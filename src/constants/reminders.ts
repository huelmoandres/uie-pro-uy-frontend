/**
 * Constantes para recordatorios.
 * Single source of truth para opciones de offset y valores por defecto.
 */

export const REMINDER_OFFSET_OPTIONS = [
  { value: -1, label: "1 día antes" },
  { value: -3, label: "3 días antes" },
  { value: -5, label: "5 días antes" },
  { value: -7, label: "7 días antes" },
] as const;

/** Presets para recordatorios de fecha fija (atajos rápidos). */
export const REMINDER_FIXED_DATE_PRESETS = [
  { value: 1, label: "En 1 día" },
  { value: 3, label: "En 3 días" },
  { value: 5, label: "En 5 días" },
  { value: 7, label: "En 7 días" },
] as const;

/** Offset por defecto al crear recordatorio (3 días antes). */
export const DEFAULT_REMINDER_OFFSET = -3;

/** Hora preferida para recordatorios relativos (9:00). */
export const DEFAULT_REMINDER_HOUR = 9;

/** Minuto preferido para recordatorios relativos. */
export const DEFAULT_REMINDER_MINUTE = 0;

/**
 * Maximum character count for the reminder body.
 * iOS typically truncates push notification bodies after ~110 chars.
 * 150 chars is a safe limit that remains readable on all platforms.
 */
export const REMINDER_BODY_MAX_LENGTH = 150;
