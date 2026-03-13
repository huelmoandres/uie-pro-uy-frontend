import { z } from "zod";

/**
 * Valida cédula de identidad uruguaya (algoritmo de dígito verificador).
 * Acepta 7 u 8 dígitos (con o sin puntos/guiones).
 */
function validateCI(ci: string): boolean {
  if (!ci) return false;

  const cleanCI = ci.replace(/\D/g, "");

  if (cleanCI.length < 7 || cleanCI.length > 8) return false;

  const padded = cleanCI.padStart(8, "0");

  const multipliers = [2, 9, 8, 7, 6, 3, 4];
  let sum = 0;

  for (let i = 0; i < 7; i++) {
    sum += parseInt(padded[i], 10) * multipliers[i];
  }

  const expectedDigit = (10 - (sum % 10)) % 10;
  const providedDigit = parseInt(padded[7], 10);

  return expectedDigit === providedDigit;
}

/**
 * Valida teléfono celular uruguayo.
 * Acepta: 8 dígitos (9XXXXXXXX) o 9 dígitos (09XXXXXXXX).
 */
function validateUruguayanMobile(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 8) return /^9\d{7}$/.test(clean);
  if (clean.length === 9) return /^09\d{7}$/.test(clean);
  return false;
}

const phoneSchema = z
  .string()
  .regex(/^[0-9]*$/, "Solo se permiten números")
  .optional()
  .refine((val) => !val || val.trim() === "" || validateUruguayanMobile(val), {
    message: "Ingresá un celular uruguayo válido (ej: 91383578 o 091383578)",
  });

const cedulaSchema = z
  .string()
  .regex(/^[0-9]*$/, "Solo se permiten números")
  .optional()
  .refine((val) => !val || val.trim() === "" || validateCI(val), {
    message: "La cédula ingresada no es válida",
  });

/**
 * Valida nombres de personas: compuestos, con apóstrofes (D'Elias), guiones (Anne-Marie),
 * acentos (José, María) y ñ. Solo permite letras, espacios, apóstrofes y guiones.
 */
const nameSchema = z
  .string()
  .min(1, "El nombre es obligatorio")
  .transform((s) => s.trim())
  .pipe(
    z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede superar 100 caracteres")
      .regex(/^[\p{L}\s'-]+$/u, {
        message:
          "El nombre solo puede contener letras, espacios, apóstrofes (') o guiones (-). Ej: Juan Carlos, D'Elias, María José",
      }),
  );

export const loginSchema = z.object({
  email: z
    .string("Campo requerido")
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),
  password: z
    .string("Campo requerido")
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: z
      .string("Campo requerido")
      .min(1, "El correo electrónico es obligatorio")
      .email("Ingresá un correo electrónico válido"),
    password: z
      .string("Campo requerido")
      .min(1, "La contraseña es obligatoria")
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirmar la contraseña es obligatorio"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  cedula: cedulaSchema,
});

/** Schema para OTP de 6 dígitos (verificación de email, recuperar contraseña). */
export const otpSchema = z
  .string()
  .length(6, "El código debe tener 6 dígitos")
  .regex(/^\d{6}$/, "El código debe ser numérico");

/** Schema para verificación de email. */
export const verifyEmailSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),
  otp: otpSchema,
});

/** Schema para recuperar contraseña (solo email). */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),
});

/** Schema para restablecer contraseña con OTP. */
export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio")
      .email("Ingresá un correo electrónico válido"),
    otp: otpSchema,
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá la contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Expediente Schema ─────────────────────────────────────────────────────

/**
 * IUE format: digits, dashes and slashes only (e.g. 40-91/2018)
 * Regex: one or more digits, optional dash/digits segment, a slash, then the year.
 */
export const followExpedienteSchema = z.object({
  iue: z
    .string()
    .min(1, "El número de expediente es obligatorio")
    .regex(
      /^\d+(-\d+)?\/\d{4}$/,
      "Formato inválido. Usá el formato correcto: 40-91/2018",
    ),
});

export type FollowExpedienteFormData = z.infer<typeof followExpedienteSchema>;
