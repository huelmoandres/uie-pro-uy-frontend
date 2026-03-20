/**
 * URLs legales requeridas por Apple Guideline 3.1.2(c).
 * Deben ser funcionales y accesibles desde la app.
 * Rutas legacy (.html) mantenidas para compatibilidad con app ya publicada.
 */
const WEB_BASE = "https://iueprouy.com";

export const LEGAL_URLS = {
  /** Política de Privacidad — obligatoria para suscripciones */
  PRIVACY_POLICY: `${WEB_BASE}/privacidad`,
  /** Términos de Uso (EULA) — obligatorio para suscripciones */
  TERMS_OF_USE: `${WEB_BASE}/terminos`,
  /** EULA estándar de Apple — solo iOS, si usás el EULA de Apple */
  APPLE_EULA: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
} as const;

/** URLs de la web para Soporte, Contacto y descarga de la app */
export const WEB_URLS = {
  HOME: WEB_BASE,
  SOPORTE: `${WEB_BASE}/soporte`,
  CONTACTO: `${WEB_BASE}/contacto`,
} as const;

/** Links de descarga en las tiendas de aplicaciones. Dejar vacío si aún no está publicado. */
export const STORE_URLS = {
  APP_STORE: "https://apps.apple.com/uy/app/iue-pro-uy/id6759987612",
  /** Completar cuando Google apruebe la app en Play Store. */
  PLAY_STORE: "",
} as const;
