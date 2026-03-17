/**
 * Espeja el NotificationPreferencesDto del backend.
 * Para agregar un nuevo tipo en el futuro, añadir el campo aquí
 * y en NOTIFICATION_TYPES de notifications.tsx.
 */
export interface INotificationPreferences {
  pushEnabled: boolean;
  expedienteUpdates: boolean;
  notifyDecrees: boolean;
  notifyAudiences: boolean;
  notifyNotifications: boolean;
  notifyWritings: boolean;
  notifyInternal: boolean;
  emailWeeklyDigest: boolean;
  digestDay: number;
  /** true si el usuario tiene al menos un token en device_tokens (solo lectura) */
  hasDeviceToken: boolean;
}

export type UpdateNotificationPreferencesPayload =
  Partial<INotificationPreferences>;
