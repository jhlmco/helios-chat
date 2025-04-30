import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSettingsStore } from './store/settingsStore';
import Layout from './components/Layout';
import ChatView from './views/ChatView';
import SettingsView from './views/SettingsView';

function App() {
  const { loadSettings, theme, initialized } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-xl font-semibold text-slate-700 dark:text-slate-200">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ChatView />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;