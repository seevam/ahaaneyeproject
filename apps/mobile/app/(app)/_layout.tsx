import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuthStore } from '@/stores/auth-store';
import { colors } from '@/constants/theme';

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const isGuest = useAuthStore((s) => s.isGuest);

  if (!token && !isGuest) return <Redirect href="/(auth)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { paddingBottom: 8, height: 60 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>💊</Text>,
          tabBarAccessibilityLabel: "Today's reminders",
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>⏰</Text>,
          tabBarAccessibilityLabel: 'Manage reminders',
        }}
      />
      {/* Stories hidden in v1 — re-enable in v2 */}
      <Tabs.Screen
        name="stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📖</Text>,
          tabBarAccessibilityLabel: 'Eye care stories',
          href: null,
        }}
      />
      {/* Reports lives inside Profile tab — no dedicated tab needed */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarAccessibilityLabel: 'Adherence reports',
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>👤</Text>,
          tabBarAccessibilityLabel: 'Profile settings',
          href: isGuest ? null : undefined,
        }}
      />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
    </Tabs>
  );
}
