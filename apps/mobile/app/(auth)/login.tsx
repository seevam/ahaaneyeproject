import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/services/api-client';
import { useTranslation } from 'react-i18next';

const COUNTRY_CODE = '+91';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      Alert.alert(t('common.error'), t('login.errorPhone'));
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${COUNTRY_CODE}${trimmed}`;
      const res = await apiClient<{ data: { token: string; user: { id: string; name: string; phone: string | null; role: string } } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ phone: fullPhone }), skipAuth: true },
      );
      signIn(res.data.token, res.data.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('login.errorDefault');
      const isNotFound = message.includes('No account');
      Alert.alert(
        isNotFound ? t('login.noAccountTitle') : t('login.errorFailed'),
        isNotFound ? t('login.noAccountMessage') : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login.title')}</Text>
      <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

      <View style={styles.phoneRow}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>{COUNTRY_CODE}</Text>
        </View>
        <TextInput
          style={styles.phoneInput}
          placeholder={t('login.phonePlaceholder')}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
          accessibilityLabel="Phone number"
        />
      </View>

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={handleLogin}
        disabled={loading}
        accessibilityLabel={t('login.signInButton')}
        accessibilityRole="button"
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnPrimaryText}>{t('login.signInButton')}</Text>}
      </TouchableOpacity>

      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity style={styles.btnLink} accessibilityLabel="Go to sign up">
          <Text style={styles.btnLinkText}>
            {t('login.noAccount')}{' '}
            <Text style={styles.linkAccent}>{t('login.signUp')}</Text>
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={styles.btnLink}
        onPress={enterGuestMode}
        accessibilityLabel={t('login.continueAsGuest')}
        accessibilityRole="button"
      >
        <Text style={styles.btnSubText}>{t('login.continueAsGuest')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    marginBottom: 16,
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
  btnSubText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  linkAccent: {
    color: '#1a73e8',
    fontWeight: '600',
  },
});
