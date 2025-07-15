const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver for shared-types package
config.resolver.alias = {
  ...config.resolver.alias,
  '@benalsam/shared-types': path.resolve(__dirname, '../shared-types/dist'),
};

// Add shared-types to watchFolders
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve(__dirname, '../shared-types'),
];

module.exports = config; 