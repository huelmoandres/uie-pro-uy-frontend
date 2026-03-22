import type {
  IAuthTokens,
  ILoginRequest,
  ILoginResponse,
  IRefreshResponse,
  IRegisterRequest,
  IRegisterResponse,
  IUser,
  IUpdateUserRequest,
  ISession,
} from "@app-types/auth.types";
import { apiClient } from "./client";

export function isLoginRequiresOtp(
  res: ILoginResponse,
): res is ILoginResponse & { requiresOtp: true; tempToken: string } {
  return "requiresOtp" in res && res.requiresOtp === true;
}

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

/**
 * Authenticates a user. Returns tokens or requiresOtp+tempToken when device limit reached.
 */
export async function login(
  credentials: ILoginRequest,
): Promise<ILoginResponse> {
  const { data } = await apiClient.post<ILoginResponse>(
    "/auth/login",
    credentials,
  );
  return data;
}

/**
 * Completes login with OTP when device limit was reached.
 */
export async function verifyLoginOtp(
  tempToken: string,
  otp: string,
): Promise<IAuthTokens> {
  const { data } = await apiClient.post<IAuthTokens>(
    "/auth/login/verify-otp",
    { tempToken, otp },
  );
  return data;
}

/**
 * Registers a new user. No retorna tokens; el usuario debe verificar el email con OTP.
 */
export async function register(
  credentials: IRegisterRequest,
): Promise<IRegisterResponse> {
  const { data } = await apiClient.post<IRegisterResponse>(
    "/auth/register",
    credentials,
  );
  return data;
}

/**
 * Verifica el email con el OTP recibido por correo.
 */
export async function verifyEmail(email: string, otp: string): Promise<void> {
  await apiClient.post("/auth/verify-email", { email, otp });
}

/**
 * Reenvía el código OTP de verificación al email.
 */
export async function resendVerificationOtp(email: string): Promise<void> {
  await apiClient.post("/auth/resend-verification-otp", { email });
}

/**
 * Exchanges a refresh token for a new access token.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<IRefreshResponse> {
  const { data } = await apiClient.post<IRefreshResponse>("/auth/refresh", {
    refreshToken,
  });
  return data;
}

/**
 * Cierra sesión en el servidor.
 * Si deviceId se provee, invalida la sesión y el refresh token de ese dispositivo.
 * Si pushToken se provee, elimina el token del dispositivo de la BD para que no
 * reciba notificaciones luego del logout (ej: cambio de cuenta en el mismo celular).
 */
export async function logout(
  deviceId?: string,
  pushToken?: string,
): Promise<void> {
  const body: Record<string, string> = {};
  if (deviceId) body.deviceId = deviceId;
  if (pushToken) body.pushToken = pushToken;
  await apiClient.post("/auth/logout", body);
}

/**
 * Solicita un código OTP al email para recuperar contraseña.
 */
export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

/**
 * Restablece la contraseña con el OTP recibido por email.
 */
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post("/auth/reset-password", { email, otp, newPassword });
}

/**
 * Gets the current authenticated user's profile.
 */
export async function getMe(): Promise<IUser> {
  const { data } = await apiClient.get<IUser>("/auth/me");
  return data;
}

/**
 * Updates the current authenticated user's profile.
 */
export async function updateProfile(
  profileData: IUpdateUserRequest,
): Promise<IUser> {
  const { data } = await apiClient.patch<IUser>("/users/me", profileData);
  return data;
}

/**
 * Elimina permanentemente la cuenta del usuario y todos sus datos.
 * Requerido por Apple Guideline 5.1.1(v).
 */
export async function deleteAccount(): Promise<void> {
  await apiClient.delete("/users/me");
}

// ─── Sessions (Dispositivos vinculados) ──────────────────────────────────────

/**
 * Lista las sesiones (dispositivos) donde el usuario está logueado.
 */
export async function getSessions(): Promise<
  ISession[]
> {
  const { data } = await apiClient.get<ISession[]>(
    "/auth/sessions",
  );
  return data;
}

/**
 * Cierra la sesión en un dispositivo específico.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/auth/sessions/${sessionId}`);
}

/**
 * Cierra la sesión en todos los demás dispositivos (mantiene el actual).
 */
export async function revokeOtherSessions(deviceId: string): Promise<void> {
  await apiClient.post("/auth/sessions/revoke-others", { deviceId });
}

export type { IAuthTokens };
