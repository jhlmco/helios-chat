import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { MessageSquare, Settings, Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

const Layout: React.FC = () => {
  const { theme, setTheme } = useSettingsStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-20 flex flex-col items-center bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="flex-1 w-full flex flex-col items-center pt-8 space-y-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`
            }
            title="Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`
            }
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </NavLink>
        </div>
        
        <div className="py-8">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            {theme === 'light' ? (
              <Moon className="w-6 h-6" />
            ) : (
              <Sun className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;