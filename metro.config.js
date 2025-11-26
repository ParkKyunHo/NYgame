// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .mjs files are treated as source files and transpiled
if (!config.resolver.sourceExts.includes('mjs')) {
    config.resolver.sourceExts.push('mjs');
}

module.exports = config;
