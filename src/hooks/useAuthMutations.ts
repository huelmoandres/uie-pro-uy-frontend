import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@services';
import { useAuth } from '@context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEYS } from '@api/client';
import type { ILoginRequest, IRegisterRequest } from '@app-types/auth.types';

export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    const { updateUserState } = useAuth();

    return useMutation({
        mutationFn: async (data: ILoginRequest) => {
            const result = await AuthService.login(data);
            await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, result.accessToken);
            return result;
        },
        onSuccess: async () => {
            const user = await AuthService.getCurrentUser();
            updateUserState(user, await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN));
            queryClient.setQueryData(['currentUser'], user);
        },
    });
};

export const useRegisterMutation = () => {
    const queryClient = useQueryClient();
    const { updateUserState } = useAuth();

    return useMutation({
        mutationFn: async (data: IRegisterRequest) => {
            const result = await AuthService.register(data);
            await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, result.accessToken);
            return result;
        },
        onSuccess: async () => {
            const user = await AuthService.getCurrentUser();
            updateUserState(user, await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN));
            queryClient.setQueryData(['currentUser'], user);
        },
    });
};
