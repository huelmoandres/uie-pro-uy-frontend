import { useCallback, useRef, useState } from "react";
import { AiService } from "@services/AiService";
import { useAnalytics } from "@hooks/useAnalytics";
import type {
  ChatMessage,
  ChatMode,
  PersistedChatMessage,
  RateLimitMeta,
} from "@app-types/ai.types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface UseAiChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  conversationId: string | null;
  sendMessage: (text: string, mode: ChatMode) => Promise<void>;
  loadConversation: (
    persistedMessages: PersistedChatMessage[],
    existingConversationId: string,
    mode: ChatMode,
  ) => void;
  clearMessages: () => void;
  abort: () => void;
}

/**
 * Gestiona el estado del chat de IA y el ciclo de vida del streaming.
 *
 * - Agrega el mensaje del usuario inmediatamente (UX optimista).
 * - Crea un mensaje del asistente vacío con `isStreaming: true`.
 * - Actualiza el contenido token a token mediante setState funcional.
 * - Al terminar (onDone / onError), marca el mensaje como no streaming.
 * - Trackea eventos de analytics (PostHog).
 * - Expone `conversationId` para navegación al historial.
 * - Expone `loadConversation` para retomar conversaciones pasadas.
 */
export function useAiChat(): UseAiChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { trackEvent } = useAnalytics();

  const appendToken = useCallback((assistantMsgId: string, token: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMsgId ? { ...m, content: m.content + token } : m,
      ),
    );
  }, []);

  const finalizeMessage = useCallback(
    (
      assistantMsgId: string,
      incomingConversationId?: string,
      errorContent?: string,
      errorStatus?: number,
      rateLimitMeta?: RateLimitMeta,
    ) => {
      setIsStreaming(false);
      if (incomingConversationId) {
        setConversationId(incomingConversationId);
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isStreaming: false,
                content: errorContent !== undefined ? errorContent : m.content,
                errorStatus,
                rateLimitMeta,
              }
            : m,
        ),
      );
    },
    [],
  );

  const sendMessage = useCallback(
    async (text: string, mode: ChatMode) => {
      if (isStreaming || !text.trim()) return;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text.trim(),
      };

      const assistantMsgId = generateId();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      abortControllerRef.current = new AbortController();

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      trackEvent("ai_chat_message_sent", {
        mode,
        isFirstMessage: messages.length === 0,
      });

      await AiService.streamChat(
        mode,
        history,
        (token) => appendToken(assistantMsgId, token),
        (incomingConversationId) =>
          finalizeMessage(assistantMsgId, incomingConversationId),
        (errorMsg, status, rateLimitMeta) => {
          if (status === 429) {
            trackEvent("ai_chat_rate_limit_hit", {
              isPro: rateLimitMeta?.isPro ?? false,
              limit: rateLimitMeta?.limit ?? 0,
            });
          }
          finalizeMessage(assistantMsgId, undefined, errorMsg, status, rateLimitMeta);
        },
        abortControllerRef.current.signal,
        conversationId ?? undefined,
      );
    },
    [isStreaming, messages, conversationId, appendToken, finalizeMessage, trackEvent],
  );

  const loadConversation = useCallback(
    (
      persistedMessages: PersistedChatMessage[],
      existingConversationId: string,
      mode: ChatMode,
    ) => {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
      const loaded: ChatMessage[] = persistedMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));
      setMessages(loaded);
      setConversationId(existingConversationId);

      trackEvent("ai_chat_conversation_loaded", {
        mode,
        messageCount: persistedMessages.length,
      });
    },
    [trackEvent],
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    abort();
    setMessages([]);
    setConversationId(null);
  }, [abort]);

  return {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    loadConversation,
    clearMessages,
    abort,
  };
}
