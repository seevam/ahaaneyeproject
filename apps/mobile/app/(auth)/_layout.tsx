import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token);
  const isGuest = useAuthStore((s) => s.isGuest);

  if (token) return <Redirect href="/(app)" />;
  if (isGuest) return <Redirect href="/(app)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
