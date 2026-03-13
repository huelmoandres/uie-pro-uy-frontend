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

/** Respuesta de login: solo tokens. El usuario se obtiene con getMe(). */
export interface ILoginResponse extends IAuthTokens {
  token?: string; // Alias legacy para accessToken
}

export interface IRegisterResponse {
  message: string;
  email: string;
}

/** Respuesta de refresh: puede incluir nuevo refreshToken si se rota. */
export interface IRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}
