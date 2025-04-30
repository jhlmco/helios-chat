import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

const GeminiSettings: React.FC = () => {
  const { gemini, setGeminiConfig } = useSettingsStore();
  
  const [apiKey, setApiKey] = useState(gemini.apiKey);
  
  const handleSave = () => {
    setGeminiConfig({
      apiKey,
    });
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
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiSettings;