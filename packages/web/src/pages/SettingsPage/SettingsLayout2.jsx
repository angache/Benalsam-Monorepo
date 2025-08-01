import React from 'react';
import { Outlet } from 'react-router-dom';

const SettingsLayout2 = ({ children }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ayarlar 2.0</h1>
        <p className="text-gray-600 dark:text-gray-400">Responsive tasarım ile geliştirilmiş ayarlar sayfası</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {children}
      </div>
    </div>
  );
};

export default SettingsLayout2; 