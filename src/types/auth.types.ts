/**
 * Authentication-related TypeScript interfaces.
 * Alineados con las respuestas del backend (AuthTokensDto, UserResponseDto).
 */

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  cedula: string | null;
  createdAt: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
  deviceId: string;
  deviceName?: string;
}

/** Respuesta cuando el límite de dispositivos está alcanzado y se requiere OTP. */
export interface ILoginRequiresOtpResponse {
  requiresOtp: true;
  tempToken: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  cedula?: string;
}

export interface IUpdateUserRequest {
  name?: string;
  phone?: string;
  cedula?: string;
}

/** Respuesta de login: tokens o requiresOtp si se superó el límite de dispositivos. */
export type ILoginResponse =
  | (IAuthTokens & { token?: string })
  | ILoginRequiresOtpResponse;

export interface IRegisterResponse {
  message: string;
  email: string;
}

/** Respuesta de refresh: puede incluir nuevo refreshToken si se rota. */
export interface IRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

/** Sesión activa (dispositivo vinculado). */
export interface ISession {
  id: string;
  deviceId: string;
  deviceName: string | null;
  lastUsedAt: string;
  createdAt: string;
}
