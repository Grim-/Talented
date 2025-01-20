import React from 'react';
import Modal from './Modal';
import Button from './Button';
import NodeTypeSelect from './NodeTypeSelect';
import { useState } from 'react';
import { HardDriveUpload, HardDriveDownload, Trash, FolderInput, FolderOutput } from 'lucide-react';

export const Toolbar = ({
  onAddNode,
  onSaveSession,
  onLoadSession,
  onExportXml,
  onImportXml,
  onClearSession,
  setTreeName,
  treeName
}) => {
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportedXml, setExportedXml] = useState('');
 

  const handleExport = async () => {
    const xml = await onExportXml();
    setExportedXml(xml);
    setShowExport(true);
  };

  return (
    <>
      <div className="absolute top-4 right-4 space-x-2">
        <Button
          onClick={() => document.getElementById('sessionLoad').click()}
          className="bg-green-500 text-white"
          leadingIcon={HardDriveUpload} 
          iconSize={20}
          iconClassName="text-white-300" 
        >
          Load Session
        </Button>
        <input
          id="sessionLoad"
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                try {
                  const data = JSON.parse(e.target.result);
                  onLoadSession(data);
                } catch (error) {
                  alert('Error loading session: ' + error.message);
                }
              };
              reader.readAsText(file);
            }
          }}
          className="hidden"
        />
        <Button 
            onClick={onSaveSession}
            className="bg-green-500 text-white"
            leadingIcon={HardDriveDownload} 
            iconSize={20}
            iconClassName="text-white-300" 
          >
            Save Session
          </Button>
        <Button
          onClick={() => setShowImport(true)}
          className="bg-green-500 text-white"
          leadingIcon={FolderInput} 
          iconSize={20}
          iconClassName="text-white-300" 
        >
          Import XML
        </Button>

        <Button
          onClick={handleExport}
          className="bg-green-500 text-white"
          leadingIcon={FolderOutput} 
          iconSize={20}
          iconClassName="text-white-300" 
        >
          Export XML
        </Button>

        <Button
          onClick={onClearSession}
          className="bg-red-500 text-white"
          leadingIcon={Trash} 
          iconSize={20}
          iconClassName="text-white-300" 
        >
          Clear Session
        </Button>
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExport} onClose={() => setShowExport(false)}>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
          {exportedXml}
        </pre>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Import XML Files</h2>
          <input
            type="file"
            multiple
            accept=".xml"
            onChange={onImportXml}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <div className="mt-4">
            <Button onClick={() => setShowImport(false)} className="bg-gray-500 text-white">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Toolbar;
