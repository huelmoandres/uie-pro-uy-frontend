/**
 * URLs legales requeridas por Apple Guideline 3.1.2(c).
 * Deben ser funcionales y accesibles desde la app.
 */
export const LEGAL_URLS = {
  /** Política de Privacidad — obligatoria para suscripciones */
  PRIVACY_POLICY: "https://iueprouy.com/privacy-policy.html",
  /** Términos de Uso (EULA) — obligatorio para suscripciones */
  TERMS_OF_USE: "https://iueprouy.com/terms.html",
  /** EULA estándar de Apple — solo iOS, si usás el EULA de Apple */
  APPLE_EULA: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
} as const;
