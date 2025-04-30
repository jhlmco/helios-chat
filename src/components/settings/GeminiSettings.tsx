import React, { useState, useEffect } from 'react';
import { RefreshCw, Check } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

const GeminiSettings: React.FC = () => {
  const { gemini, setGeminiConfig, refreshGeminiModels } = useSettingsStore();
  
  const [apiKey, setApiKey] = useState(gemini.apiKey);
  const [model, setModel] = useState(gemini.model || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    setApiKey(gemini.apiKey);
    setModel(gemini.model || '');
  }, [gemini.apiKey, gemini.model]);
  
  const handleRefreshModels = async () => {
    if (!apiKey) {
      setRefreshError('API key is required');
      return;
    }

    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      await setGeminiConfig({ apiKey });
      await refreshGeminiModels();
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Failed to fetch models');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = () => {
    setGeminiConfig({
      apiKey,
      model,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  return (
    <div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="apiKey">
            Gemini API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-slate-700"
            placeholder="Your Gemini API key"
          />
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your API key from the Google AI Studio
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" htmlFor="model">
              Model
            </label>
            <button
              onClick={handleRefreshModels}
              disabled={isRefreshing || !apiKey}
              className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Models</span>
            </button>
          </div>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 bg-white dark:bg-slate-700"
          >
            <option value="">Select a model</option>
            {gemini.availableModels.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
          {refreshError && (
            <p className="mt-1 text-sm text-red-400">{refreshError}</p>
          )}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select a Gemini model to use for chat responses
          </p>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
              isSaved 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isSaved ? 'Saved!' : 'Save Configuration'}
          </button>
          <div className={`transition-colors ${isSaved ? 'text-green-500' : 'text-slate-400'}`}>
            <Check className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiSettings;