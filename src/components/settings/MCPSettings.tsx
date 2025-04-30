import React from 'react';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { MCPServer } from '../../types';

const MCPServerCard: React.FC<{
  server: MCPServer;
  onUpdate: (config: Partial<MCPServer>) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ server, onUpdate, onRemove, isExpanded, onToggleExpand }) => {
  const validateHostname = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onUpdate({ enabled: !server.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              server.enabled ? 'bg-blue-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                server.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <input
            type="text"
            value={server.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="bg-transparent border-b border-slate-600 focus:border-blue-500 px-2 py-1 text-slate-200 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleExpand}
            className="p-1 text-slate-400 hover:text-slate-300"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-slate-400 hover:text-red-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Server URL
            </label>
            <input
              type="text"
              value={server.hostname}
              onChange={(e) => {
                const value = e.target.value;
                if (validateHostname(value)) {
                  onUpdate({ hostname: value });
                }
              }}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-200"
              placeholder="http://localhost:8081"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              API Key
            </label>
            <input
              type="password"
              value={server.apiKey}
              onChange={(e) => onUpdate({ apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-200"
              placeholder="Enter your API key"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MCPSettings: React.FC = () => {
  const { mcpServers, addMCPServer, updateMCPServer, removeMCPServer } = useSettingsStore();
  const [expandedServers, setExpandedServers] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedServers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium">MCP Servers</h3>
          <p className="text-sm text-slate-400">
            Configure Model Context Protocol servers to enhance chat responses
          </p>
        </div>
        <button
          onClick={addMCPServer}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <Plus className="w-5 h-5" />
          <span>Add Server</span>
        </button>
      </div>

      <div className="space-y-4">
        {mcpServers.map((server) => (
          <MCPServerCard
            key={server.id}
            server={server}
            onUpdate={(config) => updateMCPServer(server.id, config)}
            onRemove={() => removeMCPServer(server.id)}
            isExpanded={expandedServers.has(server.id)}
            onToggleExpand={() => toggleExpanded(server.id)}
          />
        ))}
        
        {mcpServers.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>No MCP servers configured</p>
            <p className="text-sm mt-2">Add a server to enhance chat responses with additional context</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCPSettings;