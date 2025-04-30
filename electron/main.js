import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import yaml from 'js-yaml';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      apiKey: '',
      model: '',
      availableModels: []
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
      apiKey: '',
      model: '',
      availableModels: []
    },
    mcpServers: []
  }
});

// Handle API requests
const handleRequest = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse request body for POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const settings = store.store;

        if (req.url === '/chat/openai') {
          const openai = new OpenAI({
            apiKey: settings.openai.apiKey,
            baseURL: settings.openai.hostname
          });

          const completion = await openai.chat.completions.create({
            model: settings.openai.model,
            messages: [{ role: 'user', content: data.text }],
            temperature: 0.7
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            response: completion.choices[0]?.message?.content,
            apiType: 'openai'
          }));
        } 
        else if (req.url === '/chat/gemini') {
          const genAI = new GoogleGenAI(settings.gemini.apiKey);
          const model = genAI.getGenerativeModel({ model: settings.gemini.model });

          const result = await model.generateText(data.text);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            response: result.text,
            apiType: 'gemini'
          }));
        }
        else {
          res.writeHead(404);
          res.end('Not found');
        }
      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else if (req.method === 'GET') {
    const settings = store.store;

    if (req.url === '/models/openai') {
      try {
        const openai = new OpenAI({
          apiKey: settings.openai.apiKey,
          baseURL: settings.openai.hostname
        });

        const models = await openai.models.list();
        const gptModels = models.data
          .filter(model => model.id.startsWith('gpt'))
          .map(model => model.id)
          .sort();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ models: gptModels }));
      } catch (error) {
        console.error('Error fetching OpenAI models:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    } else if (req.url === '/models/gemini') {
      try {
        // Gemini's available models are fixed
        const geminiModels = [
          'gemini-pro',
          'gemini-pro-vision'
        ];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ models: geminiModels }));
      } catch (error) {
        console.error('Error fetching Gemini models:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } else {
    res.writeHead(405);
    res.end('Method not allowed');
  }
};

// Create HTTP server and listen on port 8080
const server = createServer(handleRequest);
server.listen(8080, () => {
  console.log('API server running on port 8080');
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