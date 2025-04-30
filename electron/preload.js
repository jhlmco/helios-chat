// Preload script
import { contextBridge, ipcRenderer } from 'electron';

// Expose IPC functions to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Settings related IPC
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  setAiModel: (model) => ipcRenderer.invoke('set-ai-model', model),
  setOpenAIConfig: (config) => ipcRenderer.invoke('set-openai-config', config),
  setGeminiConfig: (config) => ipcRenderer.invoke('set-gemini-config', config),
  
  // Message related IPC
  sendMessage: (message) => ipcRenderer.invoke('send-message', message)
});