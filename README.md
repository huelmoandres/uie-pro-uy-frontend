# IUE Pro Uy — Frontend (Expo)

App móvil para seguimiento de expedientes judiciales del Poder Judicial de Uruguay.

## Requisitos

- Node.js 22+
- npm (con package-lock.json para `npm ci` en CI)
- npm
- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)

---

## Variables de entorno

La app soporta dos entornos: **Staging/Development** y **Producción**. Cada uno usa su propio archivo `.env` y genera una app distinta (bundle ID y nombre) para poder tener ambas instaladas en el mismo dispositivo.

### Setup inicial

1. Crear los archivos de entorno desde la plantilla:

```bash
cp .env.example .env.development
cp .env.example .env.production
```

2. Editar cada archivo con los valores correctos:

| Variable | Descripción |
|----------|-------------|
| `APP_ENV` | `development` o `production` — determina bundle ID y nombre de app |
| `EXPO_PUBLIC_API_URL` | URL del backend (Staging o Producción) |
| `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` | Public API key de RevenueCat para iOS |
| `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` | Public API key de RevenueCat para Android |

**RevenueCat:** Las keys se obtienen en [app.revenuecat.com](https://app.revenuecat.com) → Project settings → API Keys → Public app-specific API key (iOS/Android).

---

## Desarrollo local

```bash
# Staging (API de desarrollo)
npm run start:staging

# Producción (API real)
npm run start:production
```

Cada script carga el `.env` correspondiente antes de arrancar Expo.

---

## EAS Build y Update

### Subir variables a EAS

Antes de hacer builds o updates, subir las variables al entorno correspondiente:

```bash
# Staging / development / preview
eas env:push development --path .env.development

# Producción
eas env:push production --path .env.production
```

### Build

```bash
# Producción (iOS + Android)
eas build -e production -p all

# Solo iOS
eas build -e production -p ios

# Solo Android
eas build -e production -p android

# Development client (para preview/staging)
eas build -e development -p all
```

### Update (OTA)

```bash
# Producción
eas update --environment production --message "Descripción del cambio"

# Con auto (usa rama y commit actuales)
eas update --environment production --auto

# Staging / development
eas update --environment development --message "Fix en staging"
```

---

## CI (GitHub Actions)

El workflow en `.github/workflows/frontend-ci.yml` (repo root) se ejecuta en push a staging y PRs hacia staging/main cuando cambian archivos en `frontend/`. Incluye:

- Validación de rama (solo staging → main, no main → staging)
- Lint (`npm run lint:ci`)
- Typecheck (`npm run typecheck`)
- Build (`npm run build:ci` — expo export web)

---

## Perfiles de build (eas.json)

| Perfil | Canal | Uso |
|--------|-------|-----|
| `development` | development | Dev client, builds internos |
| `preview` | development | Preview/staging |
| `production` | production | App Store / Play Store |

---

## Bundle IDs y nombres

| Entorno | Bundle ID (iOS) | Package (Android) | Nombre app |
|---------|-----------------|-------------------|------------|
| Production | `com.iueprouy.app` | `com.iueprouy.app` | IUE Pro Uy |
| Development | `com.iueprouy.dev` | `com.iueprouy.dev` | IUE Pro Uy (Dev) |

Ambas apps pueden coexistir en el mismo dispositivo sin colisión.
