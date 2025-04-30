import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import Store from 'electron-store';

const store = new Store({
  name: 'settings',
  defaults: {
    theme: 'dark',
    aiModel: 'openai',
    openai: {
      hostname: 'https://api.openai.com/v1',
      apiKey: '',
      model: '',
      availableModels: []
    },
    gemini: {
      apiKey: ''
    },
    mcpServers: []
  }
});

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for settings
ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-theme', (_, theme) => {
  store.set('theme', theme);
  return theme;
});

ipcMain.handle('set-ai-model', (_, model) => {
  store.set('aiModel', model);
  return model;
});

ipcMain.handle('set-openai-config', (_, config) => {
  store.set('openai', config);
  return config;
});

ipcMain.handle('set-gemini-config', (_, config) => {
  store.set('gemini', config);
  return config;
});

ipcMain.handle('set-mcp-servers', (_, servers) => {
  store.set('mcpServers', servers);
  return servers;
});