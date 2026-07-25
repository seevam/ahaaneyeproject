/**
 * In-memory stub for expo-secure-store.
 *
 * Used in Expo Go where the ExpoCryptoAES native module is not available.
 * Metro redirects 'expo-secure-store' to this file via resolver.resolveRequest
 * when EAS_BUILD is not set (i.e. local Expo Go development).
 *
 * Values are lost on app restart — acceptable for development.
 */
const mem = {};

module.exports = {
  getItemAsync: async (key) => mem[key] ?? null,
  setItemAsync: async (key, value) => { mem[key] = String(value); },
  deleteItemAsync: async (key) => { delete mem[key]; },

  // Sync API (used by some internal callers)
  getItem: (key) => mem[key] ?? null,
  setItem: (key, value) => { mem[key] = String(value); },
  deleteItem: (key) => { delete mem[key]; },

  // SecureStore option constants
  AFTER_FIRST_UNLOCK: 1,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 2,
  ALWAYS: 3,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 4,
  ALWAYS_THIS_DEVICE_ONLY: 5,
  WHEN_UNLOCKED: 6,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 7,
};
