import { z } from "zod";
import { REMINDER_BODY_MAX_LENGTH } from "@constants/reminders";

export const createReminderSchema = z.object({
  processDeadlineId: z.string().uuid("ID de plazo inválido"),
  offsetDays: z
    .number()
    .int("Debe ser un número entero")
    .min(-365, "Máximo 365 días antes")
    .max(0, "Solo se permiten recordatorios antes del vencimiento"),
  timezone: z.string().min(1, "Zona horaria requerida"),
  preferredHour: z.number().int().min(0).max(23).optional(),
  preferredMinute: z.number().int().min(0).max(59).optional(),
  title: z.string().max(200).optional(),
  body: z
    .string()
    .max(
      REMINDER_BODY_MAX_LENGTH,
      `Máximo ${REMINDER_BODY_MAX_LENGTH} caracteres`,
    )
    .optional(),
});

export type CreateReminderFormData = z.infer<typeof createReminderSchema>;
