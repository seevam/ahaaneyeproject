/**
 * Stub for expo-crypto's ExpoCryptoAES native module.
 *
 * ExpoCryptoAES is NOT bundled in Expo Go (SDK 54). expo-crypto eagerly loads
 * it via `export * from './aes'` in its main entry, which is pulled in by
 * expo-auth-session/build/PKCE.js at module evaluation time.
 *
 * Metro redirects this file's import to here when EAS_BUILD is not set.
 * AES encrypt/decrypt operations will throw a clear error — acceptable for
 * Expo Go development where AES is never actually used on the hot path.
 */

class EncryptionKey {}

class SealedData {
  static fromParts() {
    return new SealedData();
  }
  static fromCombined() {
    return new SealedData();
  }
}

const stub = {
  EncryptionKey,
  SealedData,
  encryptAsync: async () => {
    throw new Error('AES encryption is not available in Expo Go. Use a development build.');
  },
  decryptAsync: async () => {
    throw new Error('AES decryption is not available in Expo Go. Use a development build.');
  },
};

module.exports = stub;
module.exports.default = stub;
