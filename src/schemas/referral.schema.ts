import { z } from "zod";

export const referralCodeSchema = z.object({
  code: z
    .string()
    .length(6, "El código debe tener 6 caracteres.")
    .regex(/^[A-Z0-9]+$/, "Solo letras y números.")
    .transform((v) => v.toUpperCase()),
});
