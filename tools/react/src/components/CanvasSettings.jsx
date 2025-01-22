import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';

const CanvasSettings = ({ onSettingChange, initialSettings = {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState({
    lockToGrid: initialSettings.lockToGrid || false,
    hierarchyMove: initialSettings.hierarchyMove || false,
    gridSize: initialSettings.gridSize || 35
  });

  const handleSettingChange = (setting, value) => {
    const newSettings = {
      ...settings,
      [setting]: value
    };
    setSettings(newSettings);
    onSettingChange?.(setting, value);
  };

  const handleToggle = (setting) => {
    handleSettingChange(setting, !settings[setting]);
  };

  const handleGridSizeChange = (e) => {
    const value = parseInt(e.target.value) || 35;
    const clampedValue = Math.max(5, Math.min(100, value));
    handleSettingChange('gridSize', clampedValue);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed right-4 top-44 bg-gray-800 p-2 rounded-md shadow-md hover:bg-gray-700 transition-colors border border-gray-700 z-50"
        title="Canvas Settings"
      >
        <Settings size={20} className="text-gray-300" />
      </button>

      {/* Settings Panel */}
      {isVisible && (
        <div className="fixed right-4 top-60 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 w-72">
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-300">Canvas Settings</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.lockToGrid}
                onChange={() => handleToggle('lockToGrid')}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300">Lock Nodes to Grid</span>
            </label>

            {settings.lockToGrid && (
              <div className="pl-7 space-y-2">
                <label className="block">
                  <span className="text-sm text-gray-400">Grid Size (px)</span>
                  <input
                    type="number"
                    value={settings.gridSize}
                    onChange={handleGridSizeChange}
                    min="5"
                    max="100"
                    className="mt-1 block w-24 rounded-md bg-gray-700 border-gray-600 text-gray-300 
                             focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </label>
              </div>
            )}

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.hierarchyMove}
                onChange={() => handleToggle('hierarchyMove')}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300">Hierarchy Move</span>
            </label>
          </div>
        </div>
      )}
    </>
  );
};

export default CanvasSettings;