import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Message } from '../types';
import { useSettingsStore } from './settingsStore';

interface MessageState {
  messages: Message[];
  isTyping: boolean;
  addMessage: (text: string, sender: 'user' | 'ai', apiType?: 'openai' | 'gemini') => void;
  setIsTyping: (isTyping: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  isTyping: false,
  
  addMessage: (text, sender, apiType) => {
    const newMessage: Message = {
      id: nanoid(),
      sender,
      text,
      timestamp: new Date().toISOString(),
      apiType,
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  setIsTyping: (isTyping) => {
    set({ isTyping });
  },

  sendMessage: async (text) => {
    const settings = useSettingsStore.getState();
    get().addMessage(text, 'user');

    try {
      set({ isTyping: true });
      
      const endpoint = settings.aiModel === 'openai' ? '/chat/openai' : '/chat/gemini';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      set({ isTyping: false });
      get().addMessage(data.response, 'ai', data.apiType);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isTyping: false });

      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Unable to reach the chat server. Please check if the application is running properly.';
        } else {
          errorMessage = error.message;
        }
      }

      get().addMessage(errorMessage, 'ai');
    }
  }
}));