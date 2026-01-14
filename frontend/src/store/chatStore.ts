/**
 * Chat Store - Manages chat conversations and messages
 */

import { create } from "zustand";
import { api } from "@/services/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    docId: string;
    title: string;
    relevance: number;
  }>;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createConversation: () => Promise<string | null>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, attachments?: string[]) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    try {
      const response = await api.get("/conversations");
      set({ conversations: response.data });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  },

  selectConversation: async (conversationId: string) => {
    set({ isLoading: true });

    try {
      const [conversationRes, messagesRes] = await Promise.all([
        api.get(`/conversations/${conversationId}`),
        api.get(`/conversations/${conversationId}/messages`),
      ]);

      set({
        currentConversation: conversationRes.data,
        messages: messagesRes.data,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: "Failed to load conversation" });
    }
  },

  createConversation: async () => {
    try {
      const response = await api.post("/conversations");
      const newConversation = response.data;

      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation,
        messages: [],
      }));

      return newConversation.id;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  },

  deleteConversation: async (conversationId: string) => {
    try {
      await api.delete(`/conversations/${conversationId}`);

      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== conversationId),
        currentConversation:
          state.currentConversation?.id === conversationId
            ? null
            : state.currentConversation,
        messages:
          state.currentConversation?.id === conversationId
            ? []
            : state.messages,
      }));
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  },

  sendMessage: async (content: string, attachments?: string[]) => {
    const { currentConversation, createConversation } = get();

    // Create conversation if needed
    let conversationId: string | undefined = currentConversation?.id;
    if (!conversationId) {
      const newId = await createConversation();
      if (!newId) return;
      conversationId = newId;
    }

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Send to API
      const response = await api.post(`/conversations/${conversationId}/messages`, {
        content,
        attachments,
      });

      const { userMessage: savedUserMessage, assistantMessage } = response.data;

      // Update with real messages from server
      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== userMessage.id),
          savedUserMessage,
          assistantMessage,
        ],
        isLoading: false,
      }));

      // Update conversation title if this is the first message
      if (get().messages.length <= 2) {
        get().fetchConversations();
      }
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== userMessage.id),
        isLoading: false,
        error: "Failed to send message",
      }));
    }
  },

  clearMessages: () => set({ messages: [], currentConversation: null }),
}));
