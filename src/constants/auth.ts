/**
 * Constantes para flujos de autenticación.
 * Las validaciones se hacen con Zod en @schemas/auth.schema.
 */

/** Longitud del código OTP (6 dígitos). */
export const OTP_LENGTH = 6;

/** Placeholder estándar para campos de email. */
export const EMAIL_PLACEHOLDER = "ejemplo@estudio.com";

/** Placeholder estándar para campos de OTP. */
export const OTP_PLACEHOLDER = "123456";

/** Mensaje que devuelve el backend cuando el email no está verificado. */
export const EMAIL_NOT_VERIFIED_MESSAGE =
  "Por favor verificá tu correo antes de iniciar sesión.";

/**
 * Mensaje genérico tras solicitar código (forgot-password, resend OTP).
 * No revela si el email existe; usa lenguaje condicional.
 */
export const CODE_REQUEST_MESSAGE =
  "Si el correo está registrado, recibirás un código. Revisá tu bandeja y la carpeta de spam.";

/** Mensaje de error genérico para registro. */
export const REGISTER_ERROR_FALLBACK =
  "No se pudo crear la cuenta. Intentá con otro correo.";

/** Mensaje de error genérico para login. */
export const LOGIN_ERROR_FALLBACK = "Credenciales inválidas o error de red.";

/** Mensaje de error para OTP inválido. */
export const OTP_INVALID_FALLBACK =
  "Código inválido o expirado. Solicitá uno nuevo.";

/** Mensaje de error para reenvío de código. */
export const RESEND_ERROR_FALLBACK = "No se pudo reenviar. Intentá más tarde.";

/** Mensaje de error para forgot-password. */
export const FORGOT_PASSWORD_ERROR_FALLBACK =
  "No se pudo enviar el código. Intentá más tarde.";
