# Manejo de Errores (Frontend)

El backend devuelve `{ statusCode, message, errorCode, correlationId }`. Usar las utilidades de `@utils/apiError`.

## Utilidades

| Función | Uso |
|---------|-----|
| `extractApiErrorMessage(err, fallback)` | Mensaje para mostrar al usuario |
| `extractApiErrorCode(err)` | Código de dominio (EXP_001, DEC_004, etc.) |
| `isDecreeQuotaError(err)` | DEC_004 o 402 → redirigir a Paywall |
| `DOMAIN_ERROR_CODES` | Constantes (DEC_004, AUTH_001) |

## Códigos que requieren acción especial

| Código | Acción en frontend |
|--------|--------------------|
| DEC_004 | Cuota IA agotada → `router.push('/paywall')` |
| AUTH_001 | Token inválido → interceptor 401 ya hace refresh/logout |

## Catálogo completo

Ver `backend/src/common/errors/domain.errors.ts`.
