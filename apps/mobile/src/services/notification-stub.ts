/**
 * No-op stubs for notifee APIs.
 * Used when running in Expo Go (which can't load @notifee/react-native native modules).
 * The real implementations live in notification-service.ts and notification-handler.ts.
 */
export async function setupNotificationChannels(): Promise<void> {}
export async function setupIOSCategories(): Promise<void> {}
export function registerNotificationHandlers(): void {}
