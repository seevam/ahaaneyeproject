import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import * as Localization from 'expo-localization';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { usePatientStore } from '@/stores/patient-store';
import type { SchedulingMode, SchedulingParams, ApiResponse } from '@eyecare/shared';

// ── Dosage instruction presets ────────────────────────────────────────────────
const DOSAGE_OPTIONS = [
  '1 drop in left eye',
  '1 drop in right eye',
  '1 drop in both eyes',
  '2 drops in left eye',
  '2 drops in right eye',
  '2 drops in both eyes',
  '1 drop in affected eye',
];

const SCHEDULING_MODES: { value: SchedulingMode; label: string; description: string }[] = [
  {
    value: 'fixed_interval',
    label: 'Fixed Interval',
    description: 'Repeat every X hours between start and end time',
  },
  {
    value: 'specific_times',
    label: 'Specific Times',
    description: 'Choose exact times for each dose',
  },
  {
    value: 'count_based',
    label: 'Count-Based (Eyedrops)',
    description: 'X drops, 5 min apart — the clinical standard for multiple eyedrops',
  },
];

export default function CreateReminderScreen() {
  const queryClient = useQueryClient();
  const activePatient = usePatientStore((s) => s.activePatient());
  const [medicationName, setMedicationName] = useState('');
  const [dosageText, setDosageText] = useState('');
  const [dosagePickerOpen, setDosagePickerOpen] = useState(false);
  const [mode, setMode] = useState<SchedulingMode>('fixed_interval');

  // Fixed interval state
  const [intervalHours, setIntervalHours] = useState('2');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');

  // Specific times state
  const [times, setTimes] = useState<string[]>(['08:00', '12:00', '18:00']);

  // Count-based state — default gap is 5 min (clinical standard for eyedrops)
  const [count, setCount] = useState('2');
  const [gapMinutes, setGapMinutes] = useState('5');
  const [countStartTime, setCountStartTime] = useState('09:00');

  const timezone = Localization.getCalendars()[0]?.timeZone || 'UTC';

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!activePatient) throw new Error('No active patient');

      let schedulingParams: SchedulingParams;
      switch (mode) {
        case 'fixed_interval':
          schedulingParams = {
            mode: 'fixed_interval',
            params: {
              intervalMinutes: parseInt(intervalHours, 10) * 60,
              startTime,
              endTime,
            },
          };
          break;
        case 'count_based':
          schedulingParams = {
            mode: 'count_based',
            params: {
              count: parseInt(count, 10),
              gapMinutes: parseInt(gapMinutes, 10),
              startTime: countStartTime,
            },
          };
          break;
        case 'specific_times':
          schedulingParams = {
            mode: 'specific_times',
            params: { times: times.filter((t) => t.match(/^\d{2}:\d{2}$/)) },
          };
          break;
        default:
          throw new Error('Invalid scheduling mode');
      }

      return apiClient<ApiResponse<{ instancesCreated: number }>>(
        `/patients/${activePatient.id}/reminders`,
        {
          method: 'POST',
          body: JSON.stringify({
            patientId: activePatient.id,
            customMedicationName: medicationName.trim(),
            dosageText: dosageText.trim() || undefined,
            schedulingMode: mode,
            schedulingParams,
            timezone,
            startDate: format(new Date(), 'yyyy-MM-dd'),
          }),
        },
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todayInstances'] });
      queryClient.invalidateQueries({ queryKey: ['reminderSchedules'] });
      const count = data.data?.instancesCreated || 0;
      Alert.alert(
        'Reminder Created',
        `${count} reminder${count !== 1 ? 's' : ''} scheduled.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    },
    onError: (err) => {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create reminder');
    },
  });

  const handleSave = () => {
    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }
    if (!activePatient) {
      Alert.alert('Error', 'Please create a patient profile first');
      return;
    }
    createMutation.mutate();
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 py-6">
      <Text className="text-2xl font-bold text-gray-900 mb-6">New Reminder</Text>

      {/* Medication Name */}
      <Text className="text-sm font-medium text-gray-700 mb-2">Medication Name</Text>
      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-4 text-base mb-4"
        placeholder="e.g. Latanoprost, Timolol"
        value={medicationName}
        onChangeText={setMedicationName}
        accessibilityLabel="Medication name"
      />

      {/* Dosage — dropdown picker */}
      <Text className="text-sm font-medium text-gray-700 mb-2">Dosage Instructions</Text>
      <TouchableOpacity
        className="border border-gray-300 rounded-xl px-4 py-4 mb-6 flex-row justify-between items-center min-h-[56px]"
        onPress={() => setDosagePickerOpen(true)}
        accessibilityLabel="Select dosage instructions"
        accessibilityRole="button"
      >
        <Text className={dosageText ? 'text-base text-gray-900' : 'text-base text-gray-400'}>
          {dosageText || 'e.g. 1 drop in both eyes'}
        </Text>
        <Text className="text-gray-400 text-lg">▾</Text>
      </TouchableOpacity>

      {/* Dosage picker modal */}
      <Modal
        visible={dosagePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDosagePickerOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setDosagePickerOpen(false)}
        />
        <View className="bg-white rounded-t-2xl px-6 pt-4 pb-10">
          <Text className="text-lg font-bold text-gray-900 mb-4">Select Dosage</Text>
          <FlatList
            data={DOSAGE_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`py-4 border-b border-gray-100 flex-row justify-between items-center min-h-[52px] ${
                  dosageText === item ? 'opacity-100' : 'opacity-80'
                }`}
                onPress={() => {
                  setDosageText(item);
                  setDosagePickerOpen(false);
                }}
                accessibilityLabel={item}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: dosageText === item }}
              >
                <Text className="text-base text-gray-800">{item}</Text>
                {dosageText === item && <Text className="text-primary-500 font-bold">✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Schedule Mode */}
      <Text className="text-sm font-medium text-gray-700 mb-3">Schedule Type</Text>
      {SCHEDULING_MODES.map((option) => (
        <TouchableOpacity
          key={option.value}
          className={`border rounded-xl p-4 mb-3 min-h-[60px] ${
            mode === option.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
          }`}
          onPress={() => setMode(option.value)}
          accessibilityLabel={`${option.label}: ${option.description}`}
          accessibilityRole="radio"
          accessibilityState={{ selected: mode === option.value }}
        >
          <Text className="text-base font-semibold text-gray-900">{option.label}</Text>
          <Text className="text-sm text-gray-500 mt-1">{option.description}</Text>
        </TouchableOpacity>
      ))}

      {/* Mode-specific inputs */}
      <View className="mt-4">
        {mode === 'fixed_interval' && (
          <>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Repeat every (hours)
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-4 text-base mb-4"
              value={intervalHours}
              onChangeText={setIntervalHours}
              keyboardType="numeric"
              accessibilityLabel="Interval in hours"
            />
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Start Time</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="HH:MM"
                  accessibilityLabel="Start time"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">End Time</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="HH:MM"
                  accessibilityLabel="End time"
                />
              </View>
            </View>
          </>
        )}

        {mode === 'specific_times' && (
          <>
            <Text className="text-sm font-medium text-gray-700 mb-2">Times</Text>
            {times.map((time, i) => (
              <View key={i} className="flex-row items-center mb-2">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-4 text-base"
                  value={time}
                  onChangeText={(val) => {
                    const updated = [...times];
                    updated[i] = val;
                    setTimes(updated);
                  }}
                  placeholder="HH:MM"
                  accessibilityLabel={`Dose time ${i + 1}`}
                />
                {times.length > 1 && (
                  <TouchableOpacity
                    className="ml-2 min-w-[44px] min-h-[44px] items-center justify-center"
                    onPress={() => setTimes(times.filter((_, j) => j !== i))}
                    accessibilityLabel={`Remove time ${i + 1}`}
                  >
                    <Text className="text-red-500 text-xl">✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity
              className="border border-dashed border-gray-300 rounded-xl py-3 items-center mt-2 mb-4 min-h-[44px]"
              onPress={() => setTimes([...times, ''])}
              accessibilityLabel="Add another time"
            >
              <Text className="text-primary-500">+ Add Time</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === 'count_based' && (
          <>
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Number of doses</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base"
                  value={count}
                  onChangeText={setCount}
                  keyboardType="numeric"
                  accessibilityLabel="Number of doses"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Minutes apart</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-base"
                  value={gapMinutes}
                  onChangeText={setGapMinutes}
                  keyboardType="numeric"
                  accessibilityLabel="Minutes between doses"
                />
              </View>
            </View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Starting at</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-4 text-base mb-4"
              value={countStartTime}
              onChangeText={setCountStartTime}
              placeholder="HH:MM"
              accessibilityLabel="Start time for count-based schedule"
            />
          </>
        )}
      </View>

      {/* Save button */}
      <TouchableOpacity
        className="bg-primary-500 rounded-xl py-4 items-center min-h-[52px] mt-4 mb-8"
        onPress={handleSave}
        disabled={createMutation.isPending}
        accessibilityLabel="Save reminder"
        accessibilityRole="button"
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Save Reminder</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
