import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import yaml from 'js-yaml';

// Initialize config directory and file
const configDir = join(homedir(), '.config', 'helios');
const configFile = join(configDir, 'config.yml');

// Ensure config directory exists
if (!existsSync(configDir)) {
  mkdirSync(configDir, { recursive: true });
}

// Create default config if it doesn't exist
if (!existsSync(configFile)) {
  const defaultConfig = {
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
  };
  
  writeFileSync(configFile, yaml.dump(defaultConfig), 'utf8');
}

// Load config from YAML
const loadConfig = () => {
  try {
    const fileContents = readFileSync(configFile, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    console.error('Error loading config:', error);
    return null;
  }
};

// Initialize the store with values from config.yml
const store = new Store({
  name: 'settings',
  defaults: loadConfig() || {
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

const updateConfig = (newSettings) => {
  try {
    writeFileSync(configFile, yaml.dump(newSettings), 'utf8');
  } catch (error) {
    console.error('Error updating config:', error);
  }
};

ipcMain.handle('set-theme', (_, theme) => {
  store.set('theme', theme);
  updateConfig(store.store);
  return theme;
});

ipcMain.handle('set-ai-model', (_, model) => {
  store.set('aiModel', model);
  updateConfig(store.store);
  return model;
});

ipcMain.handle('set-openai-config', (_, config) => {
  store.set('openai', config);
  updateConfig(store.store);
  return config;
});

ipcMain.handle('set-gemini-config', (_, config) => {
  store.set('gemini', config);
  updateConfig(store.store);
  return config;
});

ipcMain.handle('set-mcp-servers', (_, servers) => {
  store.set('mcpServers', servers);
  updateConfig(store.store);
  return servers;
});