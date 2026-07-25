import '../global.css';
import '@/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';

// Expo Go: load stubs; real build: load real notification services
const isExpoGo = Constants.appOwnership === 'expo';

const { setupNotificationChannels, setupIOSCategories } = isExpoGo
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require('@/services/notification-stub')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  : require('@/services/notification-service');

const { registerNotificationHandlers } = isExpoGo
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ? require('@/services/notification-stub')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  : require('@/services/notification-handler');

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
});

registerNotificationHandlers();
setupNotificationChannels();
setupIOSCategories();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="alarm"
            options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: 'none' }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
