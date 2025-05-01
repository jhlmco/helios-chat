import { create } from 'zustand';
import { nanoid } from 'nanoid';
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

// Helper to check if we're running in Electron
const isElectron = () => {
  return window.electron !== undefined;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  isLoading: true,
  initialized: false,
  
  setTheme: async (theme) => {
    if (isElectron()) {
      await window.electron.setTheme(theme);
    }
    set({ theme });
  },
  
  setAiModel: async (model) => {
    if (isElectron()) {
      await window.electron.setAiModel(model);
      // After setting the AI model, we need to ensure the config is up to date
      const settings = await window.electron.getSettings();
      set((state) => ({
        ...state,
        aiModel: model,
        openai: settings.openai,
        gemini: settings.gemini
      }));
    } else {
      set({ aiModel: model });
    }
  },
  
  setOpenAIConfig: async (config) => {
    if (isElectron()) {
      await window.electron.setOpenAIConfig(config);
      // After setting OpenAI config, refresh the entire settings
      const settings = await window.electron.getSettings();
      set((state) => ({
        ...state,
        openai: settings.openai
      }));
    } else {
      set((state) => ({
        openai: { ...state.openai, ...config },
      }));
    }
  },
  
  setGeminiConfig: async (config) => {
    if (isElectron()) {
      await window.electron.setGeminiConfig(config);
      // After setting Gemini config, refresh the entire settings
      const settings = await window.electron.getSettings();
      set((state) => ({
        ...state,
        gemini: settings.gemini
      }));
    } else {
      set((state) => ({
        gemini: { ...state.gemini, ...config },
      }));
    }
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
  
  loadSettings: async () => {
    try {
      let settings = defaultSettings;
      
      if (isElectron()) {
        settings = await window.electron.getSettings();
      }
      
      set({ 
        ...settings,
        isLoading: false,
        initialized: true 
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ 
        ...defaultSettings,
        isLoading: false,
        initialized: true 
      });
    }
  },

  refreshOpenAIModels: async () => {
    const state = get();
    if (!state.openai.apiKey) {
      throw new Error('OpenAI API key is required to fetch models');
    }

    try {
      const response = await fetch('http://localhost:8080/models/openai', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set((state) => ({
        openai: {
          ...state.openai,
          availableModels: data.models,
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
      // First, check if the backend is running
      const checkBackend = async () => {
        try {
          const response = await fetch('http://localhost:8080/health');
          if (!response.ok) {
            throw new Error('Backend health check failed');
          }
          return true;
        } catch (error) {
          throw new Error('Backend server is not running. Please ensure the Electron application is started and running on port 8080.');
        }
      };

      await checkBackend();

      const response = await fetch('http://localhost:8080/models/gemini', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      set((state) => ({
        gemini: {
          ...state.gemini,
          availableModels: data.models,
        },
      }));
    } catch (error) {
      console.error('Error fetching Gemini models:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred while fetching Gemini models');
    }
  },
}));