import { z } from "zod";

export const contactSupportSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresá un correo electrónico válido"),
  message: z
    .string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(2000, "El mensaje no puede superar los 2000 caracteres"),
});

export type ContactSupportFormData = z.infer<typeof contactSupportSchema>;
