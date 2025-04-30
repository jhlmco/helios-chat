import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';

const AIModelSettings: React.FC = () => {
  const { aiModel, setAiModel } = useSettingsStore();
  
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          AI Model Provider
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Select which AI provider to use for chat responses.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => setAiModel('openai')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              aiModel === 'openai'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="h-8 w-8 flex items-center justify-center mb-2 text-slate-700 dark:text-slate-300 text-xl font-bold">
              O
            </div>
            <span className="font-medium">OpenAI</span>
          </button>
          
          <button
            onClick={() => setAiModel('gemini')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              aiModel === 'gemini'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="h-8 w-8 flex items-center justify-center mb-2 text-slate-700 dark:text-slate-300 text-xl font-bold">
              G
            </div>
            <span className="font-medium">Gemini</span>
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
        <p className="text-sm">
          After selecting an AI model provider, configure its settings in the corresponding tab.
        </p>
      </div>
    </div>
  );
};

export default AIModelSettings;