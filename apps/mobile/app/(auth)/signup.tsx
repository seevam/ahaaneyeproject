import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/services/api-client';
import { useTranslation } from 'react-i18next';

const COUNTRY_CODE = '+91';

export default function SignupScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('signup.errorName'));
      return;
    }
    if (!phone.trim()) {
      Alert.alert(t('common.error'), t('signup.errorPhone'));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${COUNTRY_CODE}${phone.trim()}`;
      const res = await apiClient<{ data: { token: string; user: { id: string; name: string; phone: string | null; role: string } } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ name: name.trim(), phone: fullPhone }), skipAuth: true },
      );
      signIn(res.data.token, res.data.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('signup.errorDefault');
      Alert.alert(t('signup.errorFailed'), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t('signup.title')}</Text>
      <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>

      <TextInput
        style={styles.input}
        placeholder={t('signup.namePlaceholder')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        accessibilityLabel="Full name"
      />

      <View style={styles.phoneRow}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>{COUNTRY_CODE}</Text>
        </View>
        <TextInput
          style={styles.phoneInput}
          placeholder={t('signup.phonePlaceholder')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
          accessibilityLabel="Phone number"
        />
      </View>

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={handleCreate}
        disabled={loading}
        accessibilityLabel={t('signup.createButton')}
        accessibilityRole="button"
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnPrimaryText}>{t('signup.createButton')}</Text>}
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.btnLink} accessibilityLabel="Go to sign in">
          <Text style={styles.btnLinkText}>
            {t('signup.alreadyHaveAccount')}{' '}
            <Text style={styles.linkAccent}>{t('signup.signIn')}</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 14,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
  },
  btnPrimary: {
    backgroundColor: '#1a73e8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  btnLink: {
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 44,
  },
  btnLinkText: {
    color: '#6b7280',
    fontSize: 15,
  },
  linkAccent: {
    color: '#1a73e8',
    fontWeight: '600',
  },
});
