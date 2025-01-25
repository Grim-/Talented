import React, { useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
import FloatingPanel from './FloatingPanel';

const CURRENT_VERSION = '1.1.0';

const ChangelogPanel = () => {
  const [autoShow, setAutoShow] = useState(false);

  useEffect(() => {
    // Check if user has seen this version
    const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion');
    if (lastSeenVersion !== CURRENT_VERSION) {
      setAutoShow(true);
      // Update the last seen version
      localStorage.setItem('lastSeenChangelogVersion', CURRENT_VERSION);
    }
  }, []);

  // Version history - newest first
  const changelog = [
    {
      version: '1.0.0',
      date: '23-01-2025',
      changes: [
        'Initial release',
      ]
    },
    {
        version: '1.0.1',
        date: '23-01-2025',
        changes: [
          'Fixed Def Editor Export bug',
        ]
    },
    {
      version: '1.1.0',
      date: '24-01-2025',
      changes: [
        'Fixed Export Bugs, Exports now comes in seperate files.',
        'Added custom background BG to Canvas Settings, scaled to preview area.',
        'More export bug squashing, added multiple export options.'
      ]
  }
  ];

  return (
    <FloatingPanel
      buttonIcon={ClipboardList}
      buttonPosition="fixed right-4 top-46"
      buttonTitle="View Changelog"
      title="Changelog"
      isInitiallyVisible={autoShow}
    >
      <div className="space-y-6">
        {changelog.map(({ version, date, changes }) => (
          <div key={version} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium text-gray-300">Version {version}</h3>
              <span className="text-sm text-gray-400">{date}</span>
            </div>
            <ul className="space-y-2">
              {changes.map((change, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-400 flex-shrink-0">•</span>
                  <span className="text-gray-300">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </FloatingPanel>
  );
};

export default ChangelogPanel;