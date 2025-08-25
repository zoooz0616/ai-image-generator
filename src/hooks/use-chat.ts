import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { ChatState } from '@/types/chat';
import type { Imagen4Input } from '@/services/replicate';
import {
  createConversation,
  fetchConversations,
  fetchMessages,
  deleteConversation,
  updateConversationTitle,
  processMessage,
} from '@/services/chat';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    messages: [],
    isLoading: false,
    error: null,
  });

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (state.currentConversationId) {
      loadMessages(state.currentConversationId);
    } else {
      setState(prev => ({ ...prev, messages: [] }));
    }
  }, [state.currentConversationId]);

  const loadConversations = useCallback(async (): Promise<void> => {
    try {
      const conversations = await fetchConversations();
      setState(prev => ({ ...prev, conversations }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load conversations';
      toast.error(message);
      setState(prev => ({ ...prev, error: message }));
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const messages = await fetchMessages(conversationId);
      setState(prev => ({ 
        ...prev, 
        messages, 
        isLoading: false 
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load messages';
      toast.error(message);
      setState(prev => ({ 
        ...prev, 
        error: message, 
        isLoading: false 
      }));
    }
  }, []);

  const createNewConversation = useCallback(async (): Promise<string> => {
    try {
      const conversation = await createConversation();
      setState(prev => ({
        ...prev,
        conversations: [conversation, ...prev.conversations],
        currentConversationId: conversation.id,
        messages: [],
      }));
      return conversation.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create conversation';
      toast.error(message);
      throw error;
    }
  }, []);

  const selectConversation = useCallback((conversationId: string): void => {
    setState(prev => ({ 
      ...prev, 
      currentConversationId: conversationId 
    }));
  }, []);

  const sendMessage = useCallback(async (
    content: string, 
    imageSettings?: Omit<Imagen4Input, 'prompt'>
  ): Promise<void> => {
    let conversationId = state.currentConversationId;
    
    // Create new conversation if none selected
    if (!conversationId) {
      conversationId = await createNewConversation();
    }

    if (!conversationId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const { userMsg, assistantMsg } = await processMessage(conversationId, content, imageSettings);

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMsg, assistantMsg],
        isLoading: false,
      }));

      // Update conversation in list
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, updated_at: new Date().toISOString() }
            : conv
        ),
      }));

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(message);
      setState(prev => ({ 
        ...prev, 
        error: message, 
        isLoading: false 
      }));
    }
  }, [state.currentConversationId, createNewConversation]);

  const removeConversation = useCallback(async (conversationId: string): Promise<void> => {
    try {
      await deleteConversation(conversationId);
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(conv => conv.id !== conversationId),
        currentConversationId: prev.currentConversationId === conversationId 
          ? null 
          : prev.currentConversationId,
        messages: prev.currentConversationId === conversationId 
          ? [] 
          : prev.messages,
      }));
      toast.success('Conversation deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete conversation';
      toast.error(message);
    }
  }, []);

  const updateTitle = useCallback(async (conversationId: string, title: string): Promise<void> => {
    try {
      await updateConversationTitle(conversationId, title);
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId ? { ...conv, title } : conv
        ),
      }));
      toast.success('Title updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update title';
      toast.error(message);
    }
  }, []);

  return {
    ...state,
    createNewConversation,
    selectConversation,
    sendMessage,
    removeConversation,
    updateTitle,
    loadConversations,
  };
}