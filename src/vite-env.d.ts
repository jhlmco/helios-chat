/// <reference types="vite/client" />

interface Window {
  electron: {
    getSettings: () => Promise<{
      theme: string;
      aiModel: string;
      openai: {
        hostname: string;
        apiKey: string;
      };
      gemini: {
        apiKey: string;
      };
    }>;
    setTheme: (theme: string) => Promise<string>;
    setAiModel: (model: string) => Promise<string>;
    setOpenAIConfig: (config: { hostname: string; apiKey: string }) => Promise<{ hostname: string; apiKey: string }>;
    setGeminiConfig: (config: { apiKey: string }) => Promise<{ apiKey: string }>;
    sendMessage: (message: any) => Promise<any>;
  };
}