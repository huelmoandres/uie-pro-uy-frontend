import { apiClient } from '@api/client';
import type {
    INotificationPreferences,
    UpdateNotificationPreferencesPayload,
} from '@app-types/notification-preferences.types';

const BASE = '/notifications/preferences';

export const NotificationsApi = {
    getPreferences: async (): Promise<INotificationPreferences> => {
        const { data } = await apiClient.get<INotificationPreferences>(BASE);
        return data;
    },

    updatePreferences: async (
        payload: UpdateNotificationPreferencesPayload,
    ): Promise<INotificationPreferences> => {
        const { data } = await apiClient.patch<INotificationPreferences>(BASE, payload);
        return data;
    },
};
