module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource replaces the old nativewind/babel plugin in NativeWind v4
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      // Reanimated must be last
      'react-native-reanimated/plugin',
    ],
  };
};
