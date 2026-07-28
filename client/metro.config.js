const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith("event-target-shim") &&
    context.originModulePath.includes("react-native-webrtc")
  ) {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: require.resolve("react-native-webrtc/package.json"),
      },
      require.resolve("event-target-shim"),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;