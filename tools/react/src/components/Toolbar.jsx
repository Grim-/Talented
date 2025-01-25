import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { HardDriveUpload, HardDriveDownload, FolderInput } from 'lucide-react';
import DropdownButton from './DropdownButton';
import {exportDefEditorDefs} from '../utils/xmlSerializer';

export const Toolbar = ({
  onAddNode,
  onSaveSession,
  onLoadSession,
  onExportXml,
  onImportXml,
  onClearSession
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
      <div className="fixed top-20 right-4 flex space-x-2">
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
        
        <DropdownButton
          primary={{
            label: "Export Tree + Paths in one file.",
            action: () => { 
              onExportXml();
            }
          }}
          options={[
            { label: "Export Tree", action: () => onExportXml() },
            { label: "Export Paths", action: () => exportDefEditorDefs('PATHS') }
          ]}
        />

        <DropdownButton
          primary={{
            label: "Save Session",
            action: onSaveSession
          }}
          options={[
            { label: "Load Session", action: () => document.getElementById('sessionLoad').click() },
            { label: "Clear Session", action: onClearSession }
          ]}
        />

        <Button
          onClick={() => setShowImport(true)}
          className="bg-emerald-600 text-gray-100"
          leadingIcon={FolderInput}
          iconSize={20}
          iconClassName="text-gray-100"
        >
          Import XML
        </Button>
      </div>

      {/* Export Modal
      <Modal isOpen={showExport} onClose={() => setShowExport(false)}>
        <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-96 text-gray-100">
          {exportedXml}
        </pre>
      </Modal> */}

      {/* Import Modal */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-gray-100">Import XML Files</h2>
          <input
            type="file"
            multiple
            accept=".xml"
            onChange={onImportXml}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-700 file:text-gray-100
              hover:file:bg-gray-600"
          />
          <div className="mt-4">
            <Button onClick={() => setShowImport(false)} className="bg-gray-700 text-gray-100">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Toolbar;