interface ElectronAPI {
  getSettings: () => Promise<{
    theme: 'light' | 'dark';
    aiModel: 'openai' | 'gemini';
    openai: {
      hostname: string;
      apiKey: string;
    };
    gemini: {
      apiKey: string;
    };
  }>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  setAiModel: (model: 'openai' | 'gemini') => Promise<void>;
  setOpenAIConfig: (config: { hostname: string; apiKey: string }) => Promise<void>;
  setGeminiConfig: (config: { apiKey: string }) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
}

declare interface Window {
  electron: ElectronAPI;
}