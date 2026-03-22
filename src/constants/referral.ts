import { WEB_URLS, STORE_URLS } from "./legal";
import { APP_NAME } from "./app.constants";

/**
 * Constantes del sistema de referidos.
 * El mensaje de WhatsApp se centraliza aquí para facilitar
 * cambios de copy sin tocar los componentes.
 */


/**
 * Genera el mensaje para compartir el código de referido.
 * Solo incluye los links de tiendas que tengan URL configurada.
 */
export function getReferralShareMessage(code: string): string {
  const storeLines = [
    STORE_URLS.APP_STORE ? `📱 iPhone: ${STORE_URLS.APP_STORE}` : "",
    STORE_URLS.PLAY_STORE ? `🤖 Android: ${STORE_URLS.PLAY_STORE}` : "",
    `🌐 Web: ${WEB_URLS.HOME}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Te comparto ${APP_NAME}, la app para seguir expedientes del Poder Judicial de Uruguay sin entrar a la web de la SCJ.

Podés agregar un expediente gratis para probarla. Si te registrás con mi código *${code}*, obtenés 7 días de acceso Pro sin costo.

${storeLines}`;
}
