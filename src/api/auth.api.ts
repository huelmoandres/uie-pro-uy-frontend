import type { IAuthTokens, ILoginRequest, ILoginResponse, IRefreshResponse, IRegisterRequest, IUser, IUpdateUserRequest } from '@app-types/auth.types';
import { apiClient } from './client';

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

/**
 * Authenticates a user and returns access and refresh tokens.
 */
export async function login(credentials: ILoginRequest): Promise<ILoginResponse> {
    const { data } = await apiClient.post<ILoginResponse>('/auth/login', credentials);
    return data;
}

/**
 * Registers a new user.
 */
export async function register(credentials: IRegisterRequest): Promise<ILoginResponse> {
    const { data } = await apiClient.post<ILoginResponse>('/auth/register', credentials);
    return data;
}

/**
 * Exchanges a refresh token for a new access token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<IRefreshResponse> {
    const { data } = await apiClient.post<IRefreshResponse>('/auth/refresh', { refreshToken });
    return data;
}

/**
 * Logs out the user server-side (invalidates the refresh token).
 */
export async function logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
}

/**
 * Gets the current authenticated user's profile.
 */
export async function getMe(): Promise<IUser> {
    const { data } = await apiClient.get<IUser>('/auth/me');
    return data;
}

/**
 * Updates the current authenticated user's profile.
 */
export async function updateProfile(profileData: IUpdateUserRequest): Promise<IUser> {
    const { data } = await apiClient.patch<IUser>('/users/me', profileData);
    return data;
}

export type { IAuthTokens };
