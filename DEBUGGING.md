# Debugging — Error "stale" y tracking en producción

## Reproducir el error en el simulador

El error `Cannot read property 'stale' of undefined` ocurre cuando el usuario tiene **trial cancelado pero sigue en período de prueba** (acceso hasta la fecha de expiración).

### Pasos para reproducir (solo en __DEV__)

1. **Loguéate** con un usuario que tenga acceso (ej. email en `SUBSCRIPTION_BYPASS_EMAILS`).
2. **Andá a Configuración** (Settings).
3. **Tocá** "Simular trial cancelado (reproducir error stale)".
4. La app se recargará con el estado simulado (`isPro: true`, `isInTrial: false`).
5. Si el error ocurre, vas a ver en consola el log detallado con contexto.

### Desactivar la simulación

En Settings, tocá de nuevo el botón (ahora dirá "Desactivar simulación trial cancelado") y recargá.

---

## Error tracking en producción

### Opción 1: Sentry (recomendado)

1. **Instalá Sentry para Expo:**
   ```bash
   npx expo install @sentry/react-native
   npx @sentry/wizard@latest -i reactNative
   ```

2. **Configurá** en `app/_layout.tsx` o en el entry point:
   ```ts
   import * as Sentry from "@sentry/react-native";

   Sentry.init({
     dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
     enableInExpoDevelopment: false,
     debug: __DEV__,
   });
   ```

3. **Integrá con el error handler** en `src/utils/errorTracking.ts`:
   ```ts
   import * as Sentry from "@sentry/react-native";

   // Dentro del handler:
   Sentry.captureException(err, {
     extra: { ...report },
   });
   ```

4. **Env var:** agregá `EXPO_PUBLIC_SENTRY_DSN` a tu `.env` y a EAS Secrets.

### Opción 2: Logs en consola (actual)

En `__DEV__`, el handler en `errorTracking.ts` ya hace `console.error` con:
- Mensaje y stack del error
- Contexto: `pathname`, `isPro`, `isInTrial`, `isAuthenticated`

---

## Qué revisar cuando ocurre el error

1. **Contexto:** ¿Qué valores tenía `pathname`, `isPro`, `isInTrial`?
2. **Stack trace:** ¿En qué componente o hook se rompe?
3. **Flujo:** ¿Viene de paywall → tabs? ¿O de otra transición?

El error suele estar en el estado de navegación de React Navigation cuando el Stack se renderiza en una transición de estado de suscripción.
