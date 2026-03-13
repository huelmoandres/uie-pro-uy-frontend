import type {
  IAuthTokens,
  ILoginRequest,
  ILoginResponse,
  IRefreshResponse,
  IRegisterRequest,
  IRegisterResponse,
  IUser,
  IUpdateUserRequest,
} from "@app-types/auth.types";
import { apiClient } from "./client";

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

/**
 * Authenticates a user and returns access and refresh tokens.
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
 * Cierra sesión en el servidor (blacklist del access token).
 * El backend usa el access token del header Authorization.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
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

export type { IAuthTokens };
