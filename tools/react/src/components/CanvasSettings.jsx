import React, { useState, useRef } from 'react';
import { Settings, X, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

const CanvasSettings = ({ onSettingChange, initialSettings = {}, setBGImage, useAspectRatioPreview, setUseAspectRatioPreview }) => {
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef(null);
  const [settings, setSettings] = useState({
    lockToGrid: initialSettings.lockToGrid || false,
    hierarchyMove: initialSettings.hierarchyMove || false,
    gridSize: initialSettings.gridSize || 35,
    backgroundImage: initialSettings.backgroundImage || localStorage.getItem('treeSizePreviewBg') || ''
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result;
        if (typeof imageDataUrl === 'string') {
          setBGImage(imageDataUrl);
          localStorage.setItem('treeSizePreviewBg', imageDataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    handleSettingChange('backgroundImage', '');
    localStorage.removeItem('treeSizePreviewBg');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            {/* Background Image Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <ImageIcon size={16} />
                Background Image
              </h3>
              
              <div className="space-y-2">
                {settings.backgroundImage && (
                  <div className="relative w-full h-24 rounded-md overflow-hidden">
                    <img 
                      src={settings.backgroundImage} 
                      alt="Background Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      title="Remove background image"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Upload size={14} />
                    {settings.backgroundImage ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 my-4"></div>

            {/* Aspect Ratio Preview Toggle */}
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={useAspectRatioPreview}
                onChange={() => setUseAspectRatioPreview(!useAspectRatioPreview)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300">Maintain Aspect Ratio</span>
            </label>

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