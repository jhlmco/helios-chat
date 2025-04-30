// Main process
import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import Store from 'electron-store';

// Initialize the store for settings persistence
const store = new Store({
  name: 'settings',
  defaults: {
    theme: 'light',
    aiModel: 'openai',
    openai: {
      hostname: 'https://api.openai.com/v1',
      apiKey: ''
    },
    gemini: {
      apiKey: ''
    }
  }
});

let mainWindow;

const createWindow = () => {
  // Create the browser window
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

  // Load the app
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
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

// IPC handler for messages (simulated response for now)
ipcMain.handle('send-message', async (_, message) => {
  // Simulate a delay for "processing" the message
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a simulated response based on the model
  const aiModel = store.get('aiModel');
  
  return {
    id: Date.now().toString(),
    sender: 'ai',
    text: `This is a simulated response from the ${aiModel} model. In a real implementation, this would use the API key to call the actual AI service.`,
    timestamp: new Date().toISOString()
  };
});