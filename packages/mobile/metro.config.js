const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add buffer polyfill
config.resolver.alias = {
  ...config.resolver.alias,
  'react': path.resolve(__dirname, '../../../node_modules/react'),
  'react-native': path.resolve(__dirname, '../../../node_modules/react-native'),
  '@benalsam/shared-types': path.resolve(__dirname, '../shared-types/dist'),
  'buffer': require.resolve('buffer'),
};

// Add buffer to extraNodeModules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'buffer': require.resolve('buffer'),
};

config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, '../shared-types'),
];

module.exports = config; 