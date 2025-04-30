import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { SettingsModule } from '../types';
import ThemeSettings from '../components/settings/ThemeSettings';
import AIModelSettings from '../components/settings/AIModelSettings';
import OpenAISettings from '../components/settings/OpenAISettings';
import GeminiSettings from '../components/settings/GeminiSettings';
import MCPSettings from '../components/settings/MCPSettings';

const SettingsView: React.FC = () => {
  const { aiModel } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('ai-model');
  
  const settingsModules: SettingsModule[] = [
    {
      id: 'ai-model',
      title: 'AI Model',
      component: AIModelSettings,
    },
    {
      id: 'theme',
      title: 'Theme',
      component: ThemeSettings,
    },
    {
      id: 'mcp',
      title: 'Context Server',
      component: MCPSettings,
    },
  ];
  
  const modelSpecificSettings: SettingsModule[] = [
    {
      id: 'openai-settings',
      title: 'OpenAI Configuration',
      component: OpenAISettings,
    },
    {
      id: 'gemini-settings',
      title: 'Gemini Configuration',
      component: GeminiSettings,
    },
  ];
  
  const filteredModelSettings = modelSpecificSettings.filter((setting) => {
    if (aiModel === 'openai' && setting.id === 'openai-settings') return true;
    if (aiModel === 'gemini' && setting.id === 'gemini-settings') return true;
    return false;
  });
  
  const allSettings = [...settingsModules, ...filteredModelSettings];
  
  useEffect(() => {
    if (aiModel === 'openai' && activeTab === 'gemini-settings') {
      setActiveTab('openai-settings');
    } else if (aiModel === 'gemini' && activeTab === 'openai-settings') {
      setActiveTab('gemini-settings');
    }
  }, [aiModel, activeTab]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-slate-700 bg-slate-900 p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-slate-700 bg-slate-800 p-4">
          <nav className="space-y-1">
            {allSettings.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveTab(module.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === module.id
                    ? 'bg-blue-900/50 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-700/50'
                }`}
              >
                {module.title}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900 scrollbar-thin">
          {allSettings.map((module) => {
            const SettingComponent = module.component;
            return (
              <div
                key={module.id}
                className={activeTab === module.id ? 'block' : 'hidden'}
              >
                <h2 className="text-xl font-semibold mb-6">{module.title}</h2>
                <div className="bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                  <SettingComponent />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsView