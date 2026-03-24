# Plan: [Título corto de la feature o cambio]

> **Estado:** borrador | aprobado | en curso | hecho  
> **Autor:** [humano o agente]  
> **Fecha:** YYYY-MM-DD  
> **Ámbito:** backend | frontend | full-stack

## 1. Contexto

- Qué problema resuelve o qué oportunidad aprovecha.
- Pantallas o flujos de usuario afectados.

## 2. Objetivos y no-objetivos

**Objetivos (medibles):**

- …

**Fuera de alcance (explícito):**

- …

## 3. Contrato de API / datos

- Endpoints consumidos, tipos en `src/types/`, query keys de TanStack Query, payloads y errores esperados.
- Si hay streaming (SSE), formato de eventos y estados de UI.

## 4. Diseño técnico

- Rutas Expo Router, hooks, servicios (`src/services/`), componentes UI vs feature.
- Estado servidor vs local; RevenueCat / auth si aplica.

## 5. UX y accesibilidad

- Loading, errores, empty states, confirmaciones (`ConfirmationModal`), toasts.

## 6. Seguridad y privacidad

- Qué no enviar a analytics ni a logs; datos judiciales en UI.

## 7. Plan de ejecución (pasos ordenados)

1. …
2. …
3. …

## 8. Verificación

- Comandos: `npm run harness:check`.
- Pruebas en iOS/Android (o web) según alcance.

## 9. Rollback

- Feature flags, revert de commit, o degradación segura.

## 10. Notas para el agente / mantenedor

- Archivos clave; dependencias con el backend; enlaces a `docs/*.md` o `ai-rules.md`.

---

**Regla del repositorio:** las features **complejas** (nuevo flujo end-to-end, pagos, chat/SSE, cambios de contrato con API) deben tener un plan en `docs/plans/` **antes** de escribir código de producción. Los arreglos triviales no requieren plan.
