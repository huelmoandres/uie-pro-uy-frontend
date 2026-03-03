/**
 * Authentication-related TypeScript interfaces.
 */

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface IUser {
    id: string;
    email: string;
    role: string;
    name?: string;
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface IRegisterRequest {
    email: string;
    password: string;
    name?: string;
}

export interface ILoginResponse extends IAuthTokens {
    user: IUser;
    token: string; // Alias for accessToken
}

export interface IRefreshResponse {
    accessToken: string;
}
