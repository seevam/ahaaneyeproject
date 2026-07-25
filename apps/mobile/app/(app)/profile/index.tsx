import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const displayName = user?.name || 'User';
  const phone = user?.phone;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

      <View className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
        <Text className="text-lg font-semibold text-gray-900">{displayName}</Text>
        {phone && <Text className="text-sm text-gray-500 mt-1">{phone}</Text>}
      </View>

      <View className="bg-white rounded-2xl p-6 border border-gray-100 mb-4">
        <Text className="text-base font-semibold text-gray-700 mb-2">Patient Profiles</Text>
        <Text className="text-sm text-gray-400">
          Manage patient profiles for yourself or your loved ones.
        </Text>
        <TouchableOpacity
          className="bg-primary-50 rounded-xl py-3 items-center mt-4 min-h-[44px]"
          accessibilityLabel="Add patient profile"
          accessibilityRole="button"
        >
          <Text className="text-primary-500 font-medium">+ Add Patient</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-white rounded-2xl p-4 border border-gray-100 flex-row justify-between items-center min-h-[56px] mb-4"
        onPress={() => router.push('/(app)/reports')}
        accessibilityLabel="View adherence report"
        accessibilityRole="button"
      >
        <View className="flex-row items-center gap-3">
          <Text className="text-xl">📊</Text>
          <Text className="text-base font-medium text-gray-800">Adherence Report</Text>
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white rounded-2xl p-4 border border-gray-100 items-center min-h-[52px] justify-center"
        onPress={handleLogout}
        accessibilityLabel="Sign out"
        accessibilityRole="button"
      >
        <Text className="text-red-500 font-medium">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
