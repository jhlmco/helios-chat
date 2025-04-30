import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Settings, MCPServer } from '../types';

interface SettingsState extends Settings {
  isLoading: boolean;
  initialized: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setAiModel: (model: 'openai' | 'gemini') => void;
  setOpenAIConfig: (config: { hostname: string; apiKey: string; model?: string }) => void;
  setGeminiConfig: (config: { apiKey: string }) => void;
  addMCPServer: () => void;
  updateMCPServer: (id: string, config: Partial<MCPServer>) => void;
  removeMCPServer: (id: string) => void;
  loadSettings: () => void;
  refreshOpenAIModels: () => Promise<void>;
}

const defaultSettings: Settings = {
  theme: 'dark',
  aiModel: 'openai',
  openai: {
    hostname: 'https://api.openai.com/v1',
    apiKey: '',
    availableModels: [],
  },
  gemini: {
    apiKey: '',
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
    set({ gemini: config });
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
      const response = await fetch('http://localhost:8080/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: state.openai.apiKey,
          hostname: state.openai.hostname,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      set((state) => ({
        openai: {
          ...state.openai,
          availableModels: data.models.sort(),
        },
      }));
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },
}));