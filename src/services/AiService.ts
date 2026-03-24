import {
  deleteConversation,
  getConversation,
  listConversations,
  streamChat,
} from "@api/ai.api";
import type {
  ChatConversationDetail,
  ChatConversationSummary,
  ChatMode,
  MessageRole,
  RateLimitMeta,
  StreamChatRequest,
} from "@app-types/ai.types";

export class AiService {
  static async streamChat(
    mode: ChatMode,
    messages: { role: MessageRole; content: string }[],
    onToken: (token: string) => void,
    onDone: (conversationId: string) => void,
    onError: (
      message: string,
      status?: number,
      rateLimitMeta?: RateLimitMeta,
    ) => void,
    signal?: AbortSignal,
    conversationId?: string,
  ): Promise<void> {
    const request: StreamChatRequest = { mode, messages, conversationId };
    return streamChat(request, onToken, onDone, onError, signal);
  }

  static async listConversations(): Promise<ChatConversationSummary[]> {
    return listConversations();
  }

  static async getConversation(id: string): Promise<ChatConversationDetail> {
    return getConversation(id);
  }

  static async deleteConversation(id: string): Promise<void> {
    return deleteConversation(id);
  }
}
