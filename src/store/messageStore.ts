import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { useSettingsStore } from './settingsStore';
import { Message } from '../types';

interface MessageState {
  messages: Message[];
  isTyping: boolean;
  addMessage: (text: string, sender: 'user' | 'ai') => void;
  setIsTyping: (isTyping: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  isTyping: false,
  
  addMessage: (text, sender) => {
    const newMessage: Message = {
      id: nanoid(),
      sender,
      text,
      timestamp: new Date().toISOString(),
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
      
      const payload: any = {
        message: text,
        model: settings.aiModel,
      };

      // Add model-specific configuration
      if (settings.aiModel === 'openai') {
        if (!settings.openai.apiKey) {
          throw new Error('OpenAI API key is not configured. Please check your settings.');
        }
        payload.hostname = settings.openai.hostname;
        payload.apiKey = settings.openai.apiKey;
        payload.model = settings.openai.model;
      } else if (settings.aiModel === 'gemini') {
        if (!settings.gemini.apiKey) {
          throw new Error('Gemini API key is not configured. Please check your settings.');
        }
        payload.apiKey = settings.gemini.apiKey;
      }

      // Add enabled MCP servers
      const enabledServers = settings.mcpServers.filter(server => server.enabled);
      if (enabledServers.length > 0) {
        payload.mcpServers = enabledServers.map(server => ({
          hostname: server.hostname,
          apiKey: server.apiKey,
        }));
      }

      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || 
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      set({ isTyping: false });
      get().addMessage(data.response, 'ai');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isTyping: false });

      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = error.message;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Unable to reach the chat server. Please check if the server is running and try again.';
        } else if (error.message.startsWith('Server error:')) {
          errorMessage = error.message;
        }
      }

      get().addMessage(errorMessage, 'ai');
    }
  }
}));