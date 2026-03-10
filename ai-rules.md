# 📱 Manual de Estándares Técnicos - Frontend Judicial (Expo / React Native)

Este documento define las reglas estrictas para el desarrollo del frontend. El sistema de IA debe actuar como un Senior Mobile Architect, garantizando una UX fluida y un código 100% mantenible.

## 1. Arquitectura y Estructura de Proyecto (Expo Router)
* **Framework:** Expo SDK con **TypeScript** y **Expo Router** (File-based routing).
* **Navegación:** Uso de `app/(auth)` para el flujo de login y `app/(tabs)` para el dashboard principal.
* **Carpetas Clave:**
    * `src/api/`: Servicios de Axios e interceptores.
    * `src/components/ui/`: Componentes atómicos (Botones, Inputs) con NativeWind.
    * `src/hooks/`: Lógica de negocio (useAuth, useNotifications, useExpedientes).
    * `src/store/`: Gestión de estado global (Zustand o Context API).
    * `src/types/`: Interfaces que espejan los DTOs del backend.
    * `src/utils/`: Formateadores de fecha (date-fns) y normalizadores de IUE.

## 2. Estándares de Codificación e Idioma
* **Código:** Todo el código técnico (variables, funciones, componentes) en **Inglés**.
* **Interfaz de Usuario (UI):** Todos los textos, etiquetas y mensajes de error en **Español** (términos legales: IUE, Sede, Decreto, Carátula).
* **Nomenclatura:**
    * Componentes: `PascalCase`.
    * Hooks: `use[Name]` (camelCase).
    * Estilos: Clases de **NativeWind** (Tailwind CSS) directamente en los componentes.

## 3. Gestión de Datos y Red (Axios + TanStack Query)
* **Axios Instance:** Ubicada en `src/api/client.ts`. Debe manejar interceptores para:
    * Inyectar el `Authorization: Bearer` desde `expo-secure-store`.
    * Capturar errores 401 para disparar el logout automático.
* **React Query:** Prohibido el uso de `useEffect` para fetching de datos. Usar hooks de `@tanstack/react-query` para manejar cache, estados de carga y pull-to-refresh.
* **Tipado:** No usar `any`. Cada respuesta de la API debe estar tipada según el contrato del backend.

## 4. Estilos y Modo Oscuro (NativeWind)
* **Diseño:** Sobrio y profesional (Legal-Tech). Colores: Navy Blue, Slate Gray, y contrastes de accesibilidad.
* **Dark Mode:** Implementar soporte nativo usando el prefijo `dark:` de Tailwind.
* **Responsive:** Uso de `flex` y dimensiones relativas para asegurar que la app se vea bien en tablets y diferentes tamaños de smartphones.

## 5. Notificaciones y Persistencia
* **Expo Notifications:** Implementar el registro del push token al iniciar sesión.
* **Deep Linking:** Configurar rutas para que al tocar una notificación, la app navegue directamente al detalle del expediente (`/expedientes/[id]`).
* **Seguridad:** Datos sensibles (JWT) únicamente en `expo-secure-store`. Preferencias no sensibles en `AsyncStorage`.

## 6. Performance Senior (React Native)
* **Listas:** Usar siempre `FlashList` (de Shopify) o `FlatList` optimizada con `initialNumToRender` y `memo` en los items de expedientes.
* **Offline First:** Configurar React Query para mostrar los datos de la última sincronización si no hay conexión a internet.
* **Imágenes:** Usar `expo-image` para caching y transiciones suaves de placeholders.

## 7. Alias de Rutas (Path Aliases)
Configurar y usar siempre alias en `tsconfig.json`:
* `@/*` -> `src/*`
* `@components/*` -> `src/components/*`
* `@api/*` -> `src/api/*`
* `@hooks/*` -> `src/hooks/*`
* `@app-types/*` -> `src/types/*`

## 8. 🚨 Sistema de Alertas y Confirmaciones (Custom UI)
* **No Native Alerts:** Queda **estrictamente prohibido** el uso de `Alert.alert()` nativo de iOS/Android. Se debe utilizar un sistema de notificaciones tipo Toast (como `react-native-toast-message`) para avisos rápidos y un componente de **Modal persistente** para alertas críticas.
* **Confirmación Obligatoria:** Todas las acciones destructivas (Eliminar, Cerrar Sesión, Dejar de seguir, Limpiar Caché) deben disparar un **Modal de Confirmación** antes de ejecutarse.
* **Modal Reutilizable:** Crear un componente `src/components/ui/ConfirmationModal.tsx` que sea agnóstico al contenido. Debe recibir:
    * `title` y `description` (en Español).
    * `confirmText` y `cancelText`.
    * `type`: 'danger' (rojo) o 'primary' (azul).
    * `onConfirm`: Función a ejecutar.
* **Feedback Táctil:** Las alertas de error y los modales de confirmación de borrado deben disparar un `Haptics.notificationAsync` de tipo `Error` o `Warning`.
* **UX Smooth:** Los modales deben usar `react-native-reanimated` para entradas suaves (Fade/Slide) y no interrumpir bruscamente el flujo visual.

## 9. 🎨 Estética y Sistema de Diseño (Senior Pro UI/UX)
* **Design Tokens (Tailwind):** No usar valores "hardcoded" (ej: `text-[#123456]`). Definir una paleta extendida en `tailwind.config.js` con nombres semánticos:
    * `primary`: Navy Blue Judicial (#1E3A5F)
    * `accent`: Gold/Ocre para estados destacados (#C5A059)
    * `success`, `warning`, `danger`: Colores de estado estandarizados.
    * `surface`: Fondos de tarjetas y contenedores.
* **Tipografía Unificada:** Configurar **Inter** o **Roboto** como fuente global. Prohibido usar diferentes pesos de fuente al azar; usar solo `font-light`, `font-normal`, `font-semibold` y `font-bold`.
* **Micro-interacciones (Reanimated):**
    * Todos los cambios de estado visual (aparición de modales, expansión de detalles de expedientes) deben usar **Layout Transitions** de `react-native-reanimated`.
    * Las pulsaciones en botones deben tener un `activeOpacity` consistente o un efecto "scale down" sutil (0.97).
* **Consistencia de Bordes y Espaciados:**
    * Radio de curvatura (Border Radius) estandarizado: `rounded-xl` (12px) para tarjetas y `rounded-full` para botones de acción.
    * Escala de espaciado estricta: Usar múltiplos de 4 (p-4, m-2, gap-4).
* **Blur y Transparencias:** En iOS, utilizar `Expo Blur` para headers y tab bars con efecto traslúcido (Glassmorphism sutil). En Android, usar fondos sólidos con elevación para mantener la performance.
* **Skeletons de Carga:** Prohibido usar Spinners genéricos en pantallas principales. Implementar **Skeleton Content** que imite la forma de la `ExpedienteCard` mientras los datos se cargan desde TanStack Query.
* **Empty States Ilustrados:** Cada lista vacía (sin expedientes o sin movimientos) debe mostrar un icono de **Lucide** estilizado y un texto de ayuda claro, centrados perfectamente en la pantalla.


## 10. 🏗️ Arquitectura de Datos y Formularios (Zod + Hook Form + Query)
* **Gestión de Formularios (React Hook Form):** * Uso **obligatorio** de `useForm` para evitar re-renders innecesarios.
    * Los inputs deben integrarse mediante el componente `<Controller />` para asegurar la compatibilidad con los componentes de UI personalizados.
    * Configurar `mode: "onChange"` o `"onBlur"` para validación inmediata.
* **Validación de Esquemas (Zod):**
    * Cada formulario debe tener un esquema de **Zod** definido en `src/schemas/`.
    * Los tipos de TypeScript de los formularios se deben derivar mediante `z.infer<typeof schema>`.
    * Los mensajes de error de Zod deben estar en **Español** (ej: `.min(1, "El campo es obligatorio")`).
* **Capa de Servicios (API Services):**
    * Prohibido usar `axios` o `fetch` directamente dentro de los componentes.
    * Crear archivos de servicio por dominio en `src/services/` (ej: `AuthService.ts`, `ExpedienteService.ts`).
    * Cada método de servicio debe estar **fuertemente tipado** con las interfaces de `src/types/`.
* **Estado del Servidor (TanStack Query):**
    * Uso **exclusivo** de `useQuery` para consultas y `useMutation` para acciones (POST, PUT, DELETE).
    * Centralizar las `queryKeys` en un objeto constante para evitar errores de invalidación.
    * Implementar `onSuccess` en las mutaciones para invalidar automáticamente las queries relacionadas (ej: al seguir un expediente, refrescar la lista principal).
    * Configurar `staleTime` y `gcTime` de forma global para optimizar el uso de caché y reducir llamadas redundantes al servidor.
* **Transformación de Datos:**
    * Los servicios deben incluir una capa de **Mapping** si el formato del backend no coincide exactamente con lo que la UI necesita (ej: formatear fechas ISO a `Date` objects).
    
## 11. 🧩 Componentes de Dominio y Lógica de Reutilización
* **Domain Components (`src/components/features/`):** * Los componentes como `ExpedienteCard`, `MovementItem` o `DecreeViewer` deben ser **puros**. 
    * **Prop-Drilling:** Deben recibir los datos mediante props tipadas (ej: `interface Props { data: IExpediente }`) y no buscar los datos por su cuenta dentro del componente.
* **Componentes Genéricos (`src/components/ui/`):** * Si un componente se usa en más de una pantalla (ej: un `Card` con sombra, un `Badge` de estado), debe abstraerse.
    * Deberán soportar una prop `containerStyle` o usar `className` (via NativeWind) para permitir ajustes leves de margen/posición desde el padre sin romper la encapsulación.
* **Slot Pattern:** Para componentes complejos como Modales o Card expandibles, usar la prop `children` o "slots" (render props) para permitir que el contenido varíe manteniendo la estructura y animaciones consistentes.
* **Index Files:** Cada carpeta de componentes debe tener un `index.ts` para exportaciones limpias (ej: `import { Button, Input } from '@components/ui'`).

## 12. **Compact Design Principle:** Default to Small (sm) for components (buttons, inputs, icons) to ensure a compact, professional UI. Avoid large placeholders or oversized elements to maintain a professional, information-dense display.

## 13. 💳 Suscripciones (RevenueCat)
* **Entitlement:** `pro_access` — desbloquea acceso completo a la app.
* **Modelo:** No hay tier gratuito. La app se compra (suscripción con trial de 7 días) y da acceso a todo sin límites.
* **Product ID:** Configurar en RevenueCat Dashboard el producto "Suscripción Mensual Pro" (App Store Connect).
* **Paywall:** Pantalla `/paywall` con título "IUE.uy Pro", beneficios, botón "Suscribirse" y "Restaurar Compras" (obligatorio por Apple).
* **Legal:** El Paywall debe incluir links a Política de Privacidad y Términos de Uso (requerido por Apple).
* **Identificación:** Usar `Purchases.logIn(userId)` al autenticar y `Purchases.logOut()` al cerrar sesión.

## 14. 🔄 Gestión de Actualizaciones OTA (Expo Updates)
* **Manual Control:** Queda prohibido el comportamiento por defecto de "esperar y aplicar en el próximo reinicio" para cambios críticos. Se debe usar el hook `useUpdates` de `expo-updates`.
* **Startup Check:** Al arrancar la app (en `app/_layout.tsx`), se debe verificar si existe una actualización disponible antes de ocultar el `SplashScreen`.
* **UX de Actualización:** * Si hay una actualización disponible, mostrar un `LoadingOverlay` con el mensaje "Actualizando el sistema jurídico...".
    * Utilizar `fetchUpdateAsync()` y `reloadAsync()` para garantizar que el abogado siempre trabaje con la última versión de los servicios SOAP.
* **Error Resilience:** Si la verificación de actualización falla por falta de internet, la app debe ignorar el proceso y permitir el acceso con el código local (Offline First).
* **Logging:** Registrar en la consola (y en el sistema de logs futuro) si una actualización fue aplicada con éxito.

---
**Nota para la IA:** No reinventes la rueda. Si una utilidad de formato de fecha o validación de IUE ya existe en `src/utils`, reutilízala. Prioriza la legibilidad y el manejo de errores amigable para el usuario.