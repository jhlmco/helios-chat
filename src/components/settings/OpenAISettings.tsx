import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

const OpenAISettings: React.FC = () => {
  const { openai, setOpenAIConfig, refreshOpenAIModels } = useSettingsStore();
  
  const [hostname, setHostname] = useState(openai.hostname);
  const [apiKey, setApiKey] = useState(openai.apiKey);
  const [model, setModel] = useState(openai.model);
  const [isHostnameValid, setIsHostnameValid] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  
  const validateHostname = (value: string) => {
    try {
      new URL(value);
      setIsHostnameValid(true);
      return true;
    } catch {
      setIsHostnameValid(false);
      return false;
    }
  };
  
  const handleRefreshModels = async () => {
    if (!apiKey || !hostname) {
      setRefreshError('API key and hostname are required');
      return;
    }

    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      await refreshOpenAIModels();
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Failed to fetch models');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleHostnameBlur = () => {
    if (validateHostname(hostname)) {
      setOpenAIConfig({
        ...openai,
        hostname,
      });
    }
  };

  const handleApiKeyBlur = () => {
    setOpenAIConfig({
      ...openai,
      apiKey,
    });
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    setOpenAIConfig({
      ...openai,
      model: value,
    });
  };
  
  return (
    <div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="hostname">
            OpenAI API Hostname
          </label>
          <input
            id="hostname"
            type="text"
            value={hostname}
            onChange={(e) => {
              const value = e.target.value;
              setHostname(value);
              validateHostname(value);
            }}
            onBlur={handleHostnameBlur}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              isHostnameValid
                ? 'border-slate-600 focus:ring-blue-500'
                : 'border-red-700 focus:ring-red-600'
            } bg-slate-700 text-slate-200`}
            placeholder="https://api.openai.com/v1"
          />
          {!isHostnameValid && (
            <p className="mt-1 text-sm text-red-400">
              Please enter a valid URL
            </p>
          )}
          <p className="mt-1 text-sm text-slate-400">
            The base URL for OpenAI API requests
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="apiKey">
            OpenAI API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onBlur={handleApiKeyBlur}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-200"
            placeholder="sk-..."
          />
          <p className="mt-1 text-sm text-slate-400">
            Your OpenAI API key from the OpenAI dashboard
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" htmlFor="model">
              Model
            </label>
            <button
              onClick={handleRefreshModels}
              disabled={isRefreshing || !apiKey || !hostname}
              className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Models</span>
            </button>
          </div>
          <select
            id="model"
            value={model || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-200"
          >
            <option value="">Select a model</option>
            {openai.availableModels.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
          {refreshError && (
            <p className="mt-1 text-sm text-red-400">{refreshError}</p>
          )}
          <p className="mt-1 text-sm text-slate-400">
            Select an OpenAI model to use for chat responses
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpenAISettings;