import Constants from "expo-constants";

/**
 * Nombre oficial y versión de la app, leídos desde app.json via expo-constants.
 * Usá siempre estas constantes — nunca hardcodees el nombre o la versión.
 *
 * Al actualizar la versión en app.json se propaga automáticamente a toda la app.
 */
export const APP_NAME: string = Constants.expoConfig?.name ?? "IUE Pro Uy";

export const APP_VERSION: string = Constants.expoConfig?.version ?? "1.0.0";

/** Nombre corto sin "Uy" para contextos compactos (chips, badges, etc.) */
export const APP_NAME_SHORT = "IUE Pro";

/** Nombre completo con versión, para footers y pantallas "Acerca de". */
export const APP_NAME_VERSION = `${APP_NAME} v${APP_VERSION}`;
