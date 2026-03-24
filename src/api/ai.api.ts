import { isAxiosError } from "axios";
import { apiClient } from "@api/client";
import type {
  ChatConversationDetail,
  ChatConversationSummary,
  RateLimitMeta,
  StreamChatRequest,
} from "@app-types/ai.types";

/**
 * Envía un mensaje de chat al backend y procesa la respuesta en streaming SSE.
 *
 * Usa `apiClient` (Axios) con `responseType: "text"` y `onDownloadProgress`.
 * En React Native, XHR dispara `onprogress` a medida que llegan bytes,
 * lo que permite parsear el stream SSE sin usar fetch/ReadableStream.
 *
 * Formato SSE del backend:
 *   data: {"token":"Hola"}\n\n
 *   data: {"done":true,"conversationId":"cxxx"}\n\n
 *   data: {"error":"mensaje","status":429}\n\n
 */
export async function streamChat(
  request: StreamChatRequest,
  onToken: (token: string) => void,
  onDone: (conversationId: string) => void,
  onError: (message: string, status?: number, rateLimitMeta?: RateLimitMeta) => void,
  signal?: AbortSignal,
): Promise<void> {
  let processedLength = 0;
  let isDone = false;
  let buffer = "";

  function processChunk(newData: string): void {
    buffer += newData;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();

      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>;

        if (parsed["done"] === true) {
          isDone = true;
          onDone((parsed["conversationId"] as string) ?? "");
          return;
        }

        if (typeof parsed["error"] === "string") {
          const rateLimitMeta: RateLimitMeta | undefined =
            parsed["status"] === 429 && typeof parsed["limit"] === "number"
              ? {
                  limit: parsed["limit"] as number,
                  isPro: Boolean(parsed["isPro"]),
                  proLimit:
                    typeof parsed["proLimit"] === "number"
                      ? (parsed["proLimit"] as number)
                      : 50,
                }
              : undefined;
          onError(
            parsed["error"],
            typeof parsed["status"] === "number" ? parsed["status"] : undefined,
            rateLimitMeta,
          );
          return;
        }

        if (typeof parsed["token"] === "string" && parsed["token"]) {
          onToken(parsed["token"]);
        }
      } catch {
        // línea SSE malformada — ignorar
      }
    }
  }

  try {
    await apiClient.post("/ai/chat", request, {
      responseType: "text",
      headers: { Accept: "text/event-stream" },
      signal,
      onDownloadProgress: (progressEvent) => {
        const responseText =
          (
            progressEvent.event as {
              target?: { responseText?: string };
            }
          )?.target?.responseText ?? "";

        const newData = responseText.slice(processedLength);
        processedLength = responseText.length;

        if (newData) processChunk(newData);
      },
    });

    // Si el servidor cerró sin enviar done explícito
    if (!isDone) onDone("");
  } catch (err: unknown) {
    // AbortController canceló la petición — no es un error real
    if (isAxiosError(err) && err.code === "ERR_CANCELED") return;

    const status = isAxiosError(err) ? err.response?.status : undefined;
    const message =
      err instanceof Error
        ? err.message
        : "No se pudo conectar con el servidor de IA.";

    onError(message, status);
  }
}

// ─── Historial de conversaciones ─────────────────────────────────────────────

export async function listConversations(): Promise<ChatConversationSummary[]> {
  const { data } = await apiClient.get<ChatConversationSummary[]>(
    "/ai/chat/conversations",
  );
  return data;
}

export async function getConversation(
  id: string,
): Promise<ChatConversationDetail> {
  const { data } = await apiClient.get<ChatConversationDetail>(
    `/ai/chat/conversations/${id}`,
  );
  return data;
}

export async function deleteConversation(id: string): Promise<void> {
  await apiClient.delete(`/ai/chat/conversations/${id}`);
}
