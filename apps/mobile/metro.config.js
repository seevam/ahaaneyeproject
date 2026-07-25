const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/dist/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Expo Router needs an absolute path to the app directory.
// In a monorepo the CLI can't auto-detect it, so we set it here.
// metro.config.js runs in the main process; child workers inherit this env var.
process.env.EXPO_ROUTER_APP_ROOT = path.join(projectRoot, 'app');

let config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// ─── Expo Go compatibility ─────────────────────────────────────────────────────
// expo-secure-store v15 requires the ExpoCryptoAES native module which is NOT
// bundled in Expo Go. @clerk/clerk-expo imports it unconditionally at module
// level, crashing every route. We redirect 'expo-secure-store' to an in-memory
// stub BEFORE withNativeWind wraps the config, so our resolver is outermost and
// cannot be swallowed by NativeWind's own resolveRequest.
//
// EAS Build sets EAS_BUILD=true — native builds are unaffected.
if (!process.env.EAS_BUILD) {
  const secureStoreStub = path.resolve(projectRoot, 'src/stubs/expo-secure-store.js');
  const aesStub = path.resolve(projectRoot, 'src/stubs/ExpoCryptoAES.js');

  console.log('[metro.config] Expo Go mode — stubbing expo-secure-store + ExpoCryptoAES');

  // Set our resolver on the base config BEFORE withNativeWind so our hook is
  // outermost and cannot be swallowed by NativeWind's own resolveRequest.
  config = {
    ...config,
    resolver: {
      ...config.resolver,
      extraNodeModules: {
        ...(config.resolver.extraNodeModules || {}),
        'expo-secure-store': secureStoreStub,
      },
      resolveRequest: (context, moduleName, platform) => {
        // ── expo-secure-store ──────────────────────────────────────────────
        // @clerk/clerk-expo imports it unconditionally; ExpoSecureStore native
        // module is not in Expo Go.
        if (
          moduleName === 'expo-secure-store' ||
          moduleName.startsWith('expo-secure-store/')
        ) {
          console.log('[metro.config] stub: expo-secure-store');
          return { type: 'sourceFile', filePath: secureStoreStub };
        }

        // ── ExpoCryptoAES ──────────────────────────────────────────────────
        // expo-crypto eagerly re-exports its AES sub-module, which loads the
        // ExpoCryptoAES native module.  That native module is NOT bundled in
        // Expo Go (SDK 54).  The import path is relative ("./ExpoCryptoAES")
        // inside expo-crypto's own aes/ directory, so we guard with the
        // origin path to avoid false-positive matches in other packages.
        if (
          (moduleName === './ExpoCryptoAES' || moduleName === 'ExpoCryptoAES') &&
          context.originModulePath &&
          context.originModulePath.includes('/expo-crypto/')
        ) {
          console.log('[metro.config] stub: ExpoCryptoAES');
          return { type: 'sourceFile', filePath: aesStub };
        }

        // Fall through to Metro's default resolution.
        return context.resolveRequest(context, moduleName, platform);
      },
    },
  };
}

// withNativeWind chains its own resolveRequest on top of ours (or on top of
// nothing if EAS_BUILD is set). Either way the chain is correct.
const nativeWindConfig = withNativeWind(config, { input: './global.css' });

module.exports = nativeWindConfig;
