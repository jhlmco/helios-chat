import { create } from 'zustand';
import { nanoid } from 'nanoid';
import OpenAI from 'openai';
import { Settings, MCPServer } from '../types';

interface SettingsState extends Settings {
  isLoading: boolean;
  initialized: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setAiModel: (model: 'openai' | 'gemini') => void;
  setOpenAIConfig: (config: { hostname: string; apiKey: string; model?: string }) => void;
  setGeminiConfig: (config: { apiKey: string; model?: string }) => void;
  addMCPServer: () => void;
  updateMCPServer: (id: string, config: Partial<MCPServer>) => void;
  removeMCPServer: (id: string) => void;
  loadSettings: () => void;
  refreshOpenAIModels: () => Promise<void>;
  refreshGeminiModels: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'dark',
  aiModel: 'openai',
  openai: {
    hostname: 'https://api.openai.com/v1',
    apiKey: '',
    model: '',
    availableModels: [],
  },
  gemini: {
    apiKey: '',
    model: '',
    availableModels: [],
  },
  mcpServers: [],
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  isLoading: true,
  initialized: false,
  
  setTheme: (theme) => {
    set({ theme });
  },
  
  setAiModel: (model) => {
    set({ aiModel: model });
  },
  
  setOpenAIConfig: (config) => {
    set((state) => ({
      openai: { ...state.openai, ...config },
    }));
  },
  
  setGeminiConfig: (config) => {
    set((state) => ({
      gemini: { ...state.gemini, ...config },
    }));
  },

  addMCPServer: () => {
    const newServer: MCPServer = {
      id: nanoid(),
      enabled: true,
      name: `MCP Server ${get().mcpServers.length + 1}`,
      hostname: 'http://localhost:8081',
      apiKey: '',
    };

    set((state) => ({
      mcpServers: [...state.mcpServers, newServer],
    }));
  },

  updateMCPServer: (id, config) => {
    set((state) => ({
      mcpServers: state.mcpServers.map((server) =>
        server.id === id ? { ...server, ...config } : server
      ),
    }));
  },

  removeMCPServer: (id) => {
    set((state) => ({
      mcpServers: state.mcpServers.filter((server) => server.id !== id),
    }));
  },
  
  loadSettings: () => {
    set({ isLoading: false, initialized: true });
  },

  refreshOpenAIModels: async () => {
    const state = get();
    if (!state.openai.apiKey) {
      throw new Error('OpenAI API key is required to fetch models');
    }

    try {
      const openai = new OpenAI({
        apiKey: state.openai.apiKey,
        baseURL: state.openai.hostname,
      });

      const response = await openai.models.list();
      
      const models = response.data
        .map(model => model.id)
        .sort();

      set((state) => ({
        openai: {
          ...state.openai,
          availableModels: models,
        },
      }));
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      throw error;
    }
  },

  refreshGeminiModels: async () => {
    const state = get();
    if (!state.gemini.apiKey) {
      throw new Error('Gemini API key is required to fetch models');
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${state.gemini.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Gemini models');
      }

      const data = await response.json();
      const models = data.models
        .filter((model: any) => model.name.startsWith('models/gemini-'))
        .map((model: any) => model.name.replace('models/', ''))
        .sort();

      set((state) => ({
        gemini: {
          ...state.gemini,
          availableModels: models,
        },
      }));
    } catch (error) {
      console.error('Error fetching Gemini models:', error);
      throw error;
    }
  },
}));