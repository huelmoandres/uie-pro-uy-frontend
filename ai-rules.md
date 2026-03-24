# Manual técnico Frontend — IUE Pro Uy (Expo / React Native) + Harness para agentes IA

Este documento es la **fuente de verdad** para código nuevo en el frontend. Agentes y desarrolladores deben cumplirlo de forma **determinista**.

---

## 0. Harness Engineering (obligatorio para agentes IA)

1. **Planes first-class:** Toda feature **compleja** (flujos multi-pantalla, pagos, chat/SSE, cambios de contrato con API, sync masivo) comienza con un plan en `docs/plans/` usando `docs/plans/000-template.md`.
2. **Quality gate:** Antes de dar una tarea por terminada:

   ```bash
   npm run harness:check
   ```

   (TypeScript + ESLint + Prettier check).

3. **Sin `any`:** No usar `any` explícito. Si un SDK de terceros tipa mal, acotar con tipos propios, `unknown` + guards, o **un único** `eslint-disable-next-line` con comentario que justifique el proveedor (evitar propagar `any`).
4. **Contratos con el backend:** Los tipos en `src/types/` deben **reflejar** DTOs y respuestas reales. Cambios en la API del backend obligan a actualizar tipos y servicios en el mismo cambio (o PR vinculado).

---

## 1. Arquitectura (Expo Router)

- **Rutas:** `app/(auth)`, `app/(tabs)`, etc. Navegación con Expo Router.
- **Capas:**
  - `src/api/` — cliente Axios, interceptores, funciones de bajo nivel (p. ej. streaming).
  - `src/services/` — **única** capa que los componentes deben usar para red (no `axios`/`fetch` en pantallas).
  - `src/hooks/` — composición de Query + estado local.
  - `src/components/ui/` — atómicos; `src/components/features/` — dominio.
  - `src/types/` — contratos alineados al backend.
  - `src/schemas/` — Zod + formularios.

---

## 2. Estado y datos (reglas estrictas)

- **Servidor:** **TanStack Query** (`useQuery` / `useMutation`). **Prohibido** `useEffect` solo para fetch de datos.
- **Query keys:** Incluir `userId` (o identificador estable de sesión) en datos por usuario; en logout, `queryClient.clear()` (o invalidación acordada).
- **enabled:** `enabled: !!userId` cuando la query requiera auth.
- **Global client:** Preferencias de caché (`staleTime` / `gcTime`) coherentes con offline-first donde aplique.

---

## 3. RevenueCat (suscripciones)

- **Identificación:** Tras login exitoso, `Purchases.logIn(userId)` con el **mismo** id que usa el backend; en logout, `Purchases.logOut()`.
- **Entitlement:** `pro_access` es la fuente de verdad en el cliente para “Pro”; alinear con lo que valida el backend (`isPro`, paywall).
- **Paywall:** Ruta `/paywall`; incluir restaurar compras y enlaces legales (App Store).
- **No duplicar** lógica de precios o product IDs en múltiples sitios: centralizar constantes y flujos documentados.
- **Bypass:** Solo para entornos de desarrollo/review según variables públicas; nunca exponer bypass en builds de producción de usuarios finales.

---

## 4. Server-Sent Events (SSE) y streaming (p. ej. chat IA)

- **Transporte:** `apiClient` con `responseType: 'text'`, cabecera `Accept: text/event-stream`, y **`onDownloadProgress`** para leer `responseText` incremental (patrón en `src/api/ai.api.ts`).
- **Parsing:** Mantener un **buffer** por líneas; procesar solo líneas que empiecen con `data: `; JSON por evento (`token`, `done` con `conversationId`, `error` con `status` / meta de rate limit).
- **UI:** No bloquear el hilo principal con trabajo pesado por token; actualizar estado con funciones seguras (`setState` funcional) para evitar stale closures.
- **Cancelación:** **AbortController** por request; abortar al desmontar la pantalla o al iniciar un nuevo envío si la UX lo requiere.
- **Errores:** Mapear 429 y payload extendido a UI dedicada (sin asumir texto fijo del servidor).

---

## 5. Contratos API estrictos

- Cada endpoint consumido debe tener **tipos** y **funciones** en `src/types/` + `src/api/` o `src/services/`.
- Códigos de error del backend (`errorCode`) manejados en un solo lugar (interceptor o helpers) cuando haya redirección (paywall, sesión, etc.).
- **No** asumir campos opcionales como presentes sin optional chaining o validación Zod en formularios.

---

## 6. Zona horaria

- **`APP_TIMEZONE`:** `America/Montevideo` para datos judiciales en UI (`@constants/timezone`, `formatInTimeZone`, etc.).

---

## 7. Idioma y UI

- Código en **inglés**; textos de UI y errores al usuario en **español** (IUE, Sede, Decreto, Carátula).
- **Prohibido `Alert.alert`:** Toasts + **`ConfirmationModal`** para acciones destructivas.
- **NativeWind / tokens:** Evitar colores mágicos sueltos; usar paleta del `tailwind.config`.
- Listas: preferir **FlashList** donde ya esté el patrón; imágenes **expo-image**.

---

## 8. Formularios

- **React Hook Form** + **Zod**; mensajes de error de esquema en español.
- Sin `axios` en componentes de formulario: solo servicios.

---

## 9. Path aliases

Usar `@/*`, `@api/*`, `@components/*`, `@hooks/*`, `@app-types/*`, `@context/*`, `@services/*`, etc. (ver `tsconfig.json`).

---

## 10. Analytics (PostHog)

- **Privacidad:** No enviar IUE completas, carátulas identificables, textos de decretos ni datos judiciales sensibles en propiedades de eventos.
- Tipar propiedades como `Record<string, string | number | boolean | null | undefined>` (o tipo estrecho del dominio de analytics), evitando `any`.

---

## 11. Actualizaciones OTA (Expo Updates)

- Flujo según `app/_layout.tsx`: comprobar updates al inicio; si falla la red, continuar con bundle local.

---

## 12. Diseño compacto

- Componentes por defecto compactos (sm); densidad información adecuada a uso profesional.

---

**Instrucción final para la IA:** Ante duda entre “rápido en la pantalla” y “contrato tipado + Query correcto”, **ganan contrato y Query**. Cualquier atajo debe quedar explícito en `docs/plans/` del cambio.
