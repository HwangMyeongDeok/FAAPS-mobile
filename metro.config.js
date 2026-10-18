// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// cssInterop for NativeWind
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
