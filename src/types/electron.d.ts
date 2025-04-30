interface ElectronAPI {
  getSettings: () => Promise<{
    theme: 'light' | 'dark';
    aiModel: 'openai' | 'gemini';
    openai: {
      hostname: string;
      apiKey: string;
      model?: string;
      availableModels: string[];
    };
    gemini: {
      apiKey: string;
      model?: string;
      availableModels: string[];
    };
    mcpServers: Array<{
      id: string;
      enabled: boolean;
      name: string;
      hostname: string;
      apiKey: string;
    }>;
  }>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  setAiModel: (model: 'openai' | 'gemini') => Promise<void>;
  setOpenAIConfig: (config: { hostname: string; apiKey: string; model?: string }) => Promise<void>;
  setGeminiConfig: (config: { apiKey: string; model?: string }) => Promise<void>;
  setMCPServers: (servers: Array<{
    id: string;
    enabled: boolean;
    name: string;
    hostname: string;
    apiKey: string;
  }>) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
}

declare interface Window {
  electron: ElectronAPI;
}