import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { usePatientStore } from '@/stores/patient-store';

type Step = 1 | 2 | 3;

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(1);

  // Step 1: Patient profile
  const [patientName, setPatientName] = useState('');
  const [relationship, setRelationship] = useState<'self' | 'other'>('self');

  const createPatient = usePatientStore((s) => s.createPatient);
  const [saving, setSaving] = useState(false);

  const handleStep1 = async () => {
    if (!patientName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    setSaving(true);
    try {
      await createPatient({
        name: patientName.trim(),
        relationship: relationship === 'self' ? 'self' : 'caregiver',
      });
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStep2 = () => {
    // User can skip adding first prescription
    setStep(3);
  };

  const handleStep3 = async () => {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Notifications Recommended',
        'Without notifications, you won\'t receive medication reminders when the app is closed. You can enable them later in Settings.',
        [{ text: 'Continue Anyway', onPress: () => router.replace('/(app)') }],
      );
      return;
    }
    router.replace('/(app)');
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Progress indicator */}
      <View className="flex-row justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            className={`w-3 h-3 rounded-full mx-1 ${
              s === step ? 'bg-primary-500' : s < step ? 'bg-primary-200' : 'bg-gray-200'
            }`}
          />
        ))}
      </View>

      {step === 1 && (
        <>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Who is this for?</Text>
          <Text className="text-base text-gray-500 mb-6">
            Create a patient profile. You can add more later.
          </Text>

          <View className="flex-row mb-4">
            {(['self', 'other'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                className={`flex-1 py-3 rounded-xl items-center mr-2 min-h-[44px] border ${
                  relationship === r ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
                onPress={() => setRelationship(r)}
                accessibilityLabel={r === 'self' ? 'For myself' : 'For someone else'}
                accessibilityRole="radio"
                accessibilityState={{ selected: relationship === r }}
              >
                <Text className={relationship === r ? 'text-primary-500 font-medium' : 'text-gray-600'}>
                  {r === 'self' ? 'Myself' : 'Someone else'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-4 text-base mb-6"
            placeholder={relationship === 'self' ? 'Your name' : "Patient's name"}
            value={patientName}
            onChangeText={setPatientName}
            accessibilityLabel="Patient name"
          />

          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-4 items-center min-h-[52px]"
            onPress={handleStep1}
            disabled={saving}
            accessibilityLabel="Continue to next step"
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">Continue</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Add a Prescription</Text>
          <Text className="text-base text-gray-500 mb-6">
            You can add your first medication now or do it later.
          </Text>

          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-4 items-center min-h-[52px] mb-4"
            onPress={() => router.push('/(app)/reminders/create')}
            accessibilityLabel="Add first medication"
            accessibilityRole="button"
          >
            <Text className="text-white text-lg font-semibold">Add Medication</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 items-center min-h-[44px]"
            onPress={handleStep2}
            accessibilityLabel="Skip for now"
            accessibilityRole="button"
          >
            <Text className="text-gray-400">Skip for now</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Enable Notifications</Text>
          <Text className="text-base text-gray-500 mb-6">
            Notifications ensure your medication reminders fire even when the app is closed.
            This is essential for your eye care routine.
          </Text>

          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-4 items-center min-h-[52px] mb-4"
            onPress={handleStep3}
            accessibilityLabel="Enable notifications"
            accessibilityRole="button"
          >
            <Text className="text-white text-lg font-semibold">Enable Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 items-center min-h-[44px]"
            onPress={() => router.replace('/(app)')}
            accessibilityLabel="Skip notifications"
            accessibilityRole="button"
          >
            <Text className="text-gray-400">Not now</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
