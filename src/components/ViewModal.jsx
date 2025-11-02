import React from 'react';

const ViewModal = ({ isOpen, onClose, title, content, date, timeSpent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line mb-3">
          {content}
        </p>

        <div className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
          <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
          <p><strong>Time Spent:</strong> {timeSpent}</p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ViewModal;