const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  setAiModel: (model) => ipcRenderer.invoke('set-ai-model', model),
  setOpenAIConfig: (config) => ipcRenderer.invoke('set-openai-config', config),
  setGeminiConfig: (config) => ipcRenderer.invoke('set-gemini-config', config),
  setMCPServers: (servers) => ipcRenderer.invoke('set-mcp-servers', servers),
  sendMessage: (message) => ipcRenderer.invoke('send-message', message)
});