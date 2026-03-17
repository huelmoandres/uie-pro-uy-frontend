/**
 * URLs legales requeridas por Apple Guideline 3.1.2(c).
 * Deben ser funcionales y accesibles desde la app.
 * Rutas legacy (.html) mantenidas para compatibilidad con app ya publicada.
 */
const WEB_BASE = "https://iueprouy.com";

export const LEGAL_URLS = {
  /** Política de Privacidad — obligatoria para suscripciones */
  PRIVACY_POLICY: `${WEB_BASE}/privacy-policy.html`,
  /** Términos de Uso (EULA) — obligatorio para suscripciones */
  TERMS_OF_USE: `${WEB_BASE}/terms.html`,
  /** EULA estándar de Apple — solo iOS, si usás el EULA de Apple */
  APPLE_EULA: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
} as const;

/** URLs de la web para Soporte y Contacto (por si se abren en navegador) */
export const WEB_URLS = {
  SOPORTE: `${WEB_BASE}/support.html`,
  CONTACTO: `${WEB_BASE}/contacto`,
} as const;
