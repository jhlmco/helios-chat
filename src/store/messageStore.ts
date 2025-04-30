import { create } from 'zustand';
import { nanoid } from 'nanoid';
import OpenAI from 'openai';
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
      
      let aiResponse: string;
      
      if (settings.aiModel === 'openai') {
        if (!settings.openai.apiKey || !settings.openai.model) {
          throw new Error('OpenAI API key and model must be configured in settings.');
        }

        const openai = new OpenAI({
          apiKey: settings.openai.apiKey,
          baseURL: settings.openai.hostname,
          defaultHeaders: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-stainless-timeout'
          }
        });

        const completion = await openai.chat.completions.create({
          model: settings.openai.model,
          messages: [{ role: 'user', content: text }],
          temperature: 0.7,
        });

        aiResponse = completion.choices[0]?.message?.content;
        if (!aiResponse) {
          throw new Error('Invalid response from OpenAI');
        }

      } else if (settings.aiModel === 'gemini') {
        if (!settings.gemini.apiKey || !settings.gemini.model) {
          throw new Error('Gemini API key and model must be configured in settings.');
        }

        const modelName = settings.gemini.model.startsWith('models/') 
          ? settings.gemini.model 
          : `models/${settings.gemini.model}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${settings.gemini.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, x-stainless-timeout'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: text
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
              },
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Gemini API request failed');
        }

        const data = await response.json();
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiResponse) {
          throw new Error('Invalid response from Gemini');
        }
      } else {
        throw new Error('Invalid AI model selected');
      }

      set({ isTyping: false });
      get().addMessage(aiResponse, 'ai');
      
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isTyping: false });

      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = error.message;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Unable to reach the AI service. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      get().addMessage(errorMessage, 'ai');
    }
  }
}));