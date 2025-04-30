import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useSettingsStore();
  
  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Application Theme
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Choose the appearance of the application interface.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Sun className="w-8 h-8 mb-2 text-slate-700 dark:text-slate-300" />
            <span className="font-medium">Light Mode</span>
          </button>
          
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Moon className="w-8 h-8 mb-2 text-slate-700 dark:text-slate-300" />
            <span className="font-medium">Dark Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;