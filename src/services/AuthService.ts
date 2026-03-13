import { login, register, getMe } from "@api/auth.api";
import type {
  ILoginRequest,
  IRegisterRequest,
  IUser,
  ILoginResponse,
  IRegisterResponse,
} from "@app-types/auth.types";

export class AuthService {
  static async login(data: ILoginRequest): Promise<ILoginResponse> {
    const response = await login(data);
    return {
      ...response,
      token: response.accessToken,
    };
  }

  static async register(data: IRegisterRequest): Promise<IRegisterResponse> {
    return register(data);
  }

  static async getCurrentUser(): Promise<IUser> {
    return await getMe();
  }
}
