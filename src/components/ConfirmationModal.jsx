import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all duration-300 scale-100">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-200">Confirm</button>
          <button onClick={onClose} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;