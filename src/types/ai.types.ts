export type ChatMode = "APP_FAQ" | "EXPEDIENTE_ASSISTANT" | "LEGAL_GENERAL";

export type MessageRole = "user" | "assistant";

/** Metadata incluida en el evento SSE de error 429 (rate limit). */
export interface RateLimitMeta {
  /** Límite diario del plan actual del usuario. */
  limit: number;
  /** true si el usuario ya es Pro. */
  isPro: boolean;
  /** Límite del plan Pro (para mostrar upgrade hint). */
  proLimit: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** true mientras el token stream aún está llegando */
  isStreaming?: boolean;
  /** HTTP status del error si el mensaje es un error del servidor */
  errorStatus?: number;
  /** Disponible cuando errorStatus === 429 */
  rateLimitMeta?: RateLimitMeta;
}

export interface ChatModeOption {
  mode: ChatMode;
  label: string;
  description: string;
  /** Mensaje de disclaimer que se muestra al pie para modos legales */
  disclaimer?: string;
}

export const CHAT_MODES: ChatModeOption[] = [
  {
    mode: "EXPEDIENTE_ASSISTANT",
    label: "Mis Expedientes",
    description: "Consultá sobre tus expedientes y plazos",
    disclaimer:
      "⚠️ Verificá siempre las fechas directamente en el Poder Judicial.",
  },
  {
    mode: "LEGAL_GENERAL",
    label: "Consultas Legales",
    description: "Preguntas sobre derecho procesal uruguayo",
    disclaimer:
      "⚠️ Esta información es orientativa y no reemplaza el asesoramiento de un profesional.",
  },
  {
    mode: "APP_FAQ",
    label: "Soporte",
    description: "Ayuda sobre cómo usar IUE Pro Uy",
  },
];

export interface StreamChatRequest {
  mode: ChatMode;
  messages: { role: MessageRole; content: string }[];
  /** ID de conversación existente para continuar. Omitir para nueva. */
  conversationId?: string;
}

// ─── Historial de conversaciones ────────────────────────────────────────────

export interface ChatConversationSummary {
  id: string;
  mode: ChatMode;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  /** Vista previa del último mensaje (lista historial). */
  lastMessagePreview: string | null;
}

export interface ChatConversationDetail {
  id: string;
  mode: ChatMode;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: PersistedChatMessage[];
}

export interface PersistedChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}
