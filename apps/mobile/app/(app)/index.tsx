import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiClient } from '@/services/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { usePatientStore } from '@/stores/patient-store';
import type { ReminderInstance, ReminderSchedule, ApiResponse } from '@eyecare/shared';

type InstanceWithSchedule = ReminderInstance & {
  schedule?: ReminderSchedule;
};

export default function TodayScreen() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const token = useAuthStore((s) => s.token);
  const { activePatientId, fetchPatients, patients } = usePatientStore();

  useEffect(() => {
    if (token) fetchPatients();
  }, [token, fetchPatients]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['todayInstances', activePatientId, today],
    queryFn: async () => {
      if (!activePatientId) return { data: [] as InstanceWithSchedule[] };
      return apiClient<ApiResponse<InstanceWithSchedule[]>>(
        `/patients/${activePatientId}/instances?startDate=${today}&endDate=${today}`,
      );
    },
    enabled: !!activePatientId,
  });

  const instances = data?.data || [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-green-100 border-green-300';
      case 'missed': return 'bg-red-100 border-red-300';
      case 'snoozed': return 'bg-yellow-100 border-yellow-300';
      case 'skipped': return 'bg-gray-100 border-gray-300';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken': return '✓';
      case 'missed': return '✕';
      case 'snoozed': return '⏰';
      case 'skipped': return '—';
      default: return '○';
    }
  };

  const getMedicationName = (instance: InstanceWithSchedule) => {
    return instance.schedule?.customMedicationName || 'Medication';
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* ── Punchline banner ──────────────────────────────────────────────── */}
      <View className="bg-primary-500 px-6 pt-5 pb-4">
        <Text className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">
          Our mission
        </Text>
        <Text className="text-white text-xl font-bold mt-1">
          Impact an Eye Every Day 👁️
        </Text>
      </View>

      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Today&apos;s Schedule</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {format(new Date(), 'EEEE, MMMM d')}
        </Text>
      </View>

      {!activePatientId && patients.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">👁️</Text>
          <Text className="text-xl font-semibold text-gray-700 mb-2">Welcome!</Text>
          <Text className="text-gray-500 text-center mb-6">
            Create a patient profile to get started with your eye care routine.
          </Text>
          <Link href="/(app)/onboarding" asChild>
            <TouchableOpacity
              className="bg-primary-500 rounded-xl py-4 px-8 min-h-[52px]"
              accessibilityLabel="Get started"
              accessibilityRole="button"
            >
              <Text className="text-white text-lg font-semibold">Get Started</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Loading...</Text>
        </View>
      ) : instances.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">👁️</Text>
          <Text className="text-xl font-semibold text-gray-700 mb-2">No reminders today</Text>
          <Text className="text-gray-500 text-center mb-6">
            Add a medication reminder to get started.
          </Text>
          <Link href="/(app)/reminders/create" asChild>
            <TouchableOpacity
              className="bg-primary-500 rounded-xl py-4 px-8 min-h-[52px]"
              accessibilityLabel="Add reminder"
              accessibilityRole="button"
            >
              <Text className="text-white text-lg font-semibold">Add Reminder</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={instances}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-6"
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <View className={`border rounded-xl p-4 mb-3 ${getStatusStyle(item.status)}`}>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {getMedicationName(item)}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {format(new Date(item.scheduledTime), 'h:mm a')}
                    {item.schedule?.dosageText ? ` · ${item.schedule.dosageText}` : ''}
                  </Text>
                </View>
                <View className="min-w-[80px] items-end">
                  <Text className="text-lg">{getStatusIcon(item.status)}</Text>
                  <Text className="text-xs font-medium capitalize text-gray-500 mt-1">
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
