import {
  login,
  verifyLoginOtp,
  register,
  getMe,
  getSessions as getSessionsApi,
  deleteSession as deleteSessionApi,
  revokeOtherSessions as revokeOtherSessionsApi,
} from "@api/auth.api";
import type {
  ILoginRequest,
  IRegisterRequest,
  IUser,
  ILoginResponse,
  IRegisterResponse,
  IAuthTokens,
  ISession,
} from "@app-types/auth.types";

export class AuthService {
  static readonly queryKeys = {
    currentUser: ["currentUser"] as const,
    sessions: ["sessions"] as const,
  };

  static async login(data: ILoginRequest): Promise<ILoginResponse> {
    const response = await login(data);
    if ("accessToken" in response) {
      return { ...response, token: response.accessToken };
    }
    return response;
  }

  static async verifyLoginOtp(
    tempToken: string,
    otp: string,
  ): Promise<IAuthTokens> {
    return verifyLoginOtp(tempToken, otp);
  }

  static async register(data: IRegisterRequest): Promise<IRegisterResponse> {
    return register(data);
  }

  static async getCurrentUser(): Promise<IUser> {
    return await getMe();
  }

  static async getSessions(): Promise<ISession[]> {
    return getSessionsApi();
  }

  static async deleteSession(sessionId: string): Promise<void> {
    return deleteSessionApi(sessionId);
  }

  static async revokeOtherSessions(deviceId: string): Promise<void> {
    return revokeOtherSessionsApi(deviceId);
  }
}
