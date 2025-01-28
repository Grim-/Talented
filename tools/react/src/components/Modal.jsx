import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70  flex items-center justify-center"
    style={{
      zIndex: 10000
    }}
    >
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full m-4 border border-gray-700 text-black">
        {children}
        <div className="flex bg-gray-800 justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;