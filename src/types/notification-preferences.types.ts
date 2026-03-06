/**
 * Espeja el NotificationPreferencesDto del backend.
 * Para agregar un nuevo tipo en el futuro, añadir el campo aquí
 * y en NOTIFICATION_TYPES (notifications.api.ts).
 */
export interface INotificationPreferences {
    pushEnabled: boolean;
    expedienteUpdates: boolean;
}

export type UpdateNotificationPreferencesPayload = Partial<INotificationPreferences>;
