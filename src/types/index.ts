export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface MCPServer {
  id: string;
  enabled: boolean;
  name: string;
  hostname: string;
  apiKey: string;
}

export interface Settings {
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
  mcpServers: MCPServer[];
}

export interface SettingsModule {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}