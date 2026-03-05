import { login, register, getMe } from '@api/auth.api';
import type { ILoginRequest, IRegisterRequest, IUser, ILoginResponse } from '@app-types/auth.types';

export class AuthService {
    static async login(data: ILoginRequest): Promise<ILoginResponse> {
        const response = await login(data);
        return {
            ...response,
            token: response.accessToken,
        };
    }

    static async register(data: IRegisterRequest): Promise<ILoginResponse> {
        const response = await register(data);
        return {
            ...response,
            token: response.accessToken,
        };
    }

    static async getCurrentUser(): Promise<IUser> {
        return await getMe();
    }
}
