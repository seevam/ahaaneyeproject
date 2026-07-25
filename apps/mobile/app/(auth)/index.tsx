import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';

const { width } = Dimensions.get('window');
const HERO_SIZE = width * 0.72;

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* ── Logo ────────────────────────────────────────────────────────────
           When logo.png is ready, replace the wordmark block below with:

           <Image
             source={require('../../assets/logo.png')}
             style={styles.logo}
             resizeMode="contain"
             accessibilityLabel="Aahan Eye logo"
           />
      ──────────────────────────────────────────────────────────────────── */}
      <View style={styles.logoArea}>
        {/* Text wordmark — placeholder until logo.png is added to assets */}
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkIcon}>👁️</Text>
          <Text style={styles.wordmarkText}>aahan<Text style={styles.wordmarkAccent}>eye</Text></Text>
        </View>

        {/* Language selector — top-right */}
        <LanguageSelector />
      </View>

      {/* Hero illustration */}
      <View style={styles.heroArea}>
        <View style={[styles.ring, { width: HERO_SIZE, height: HERO_SIZE, borderRadius: HERO_SIZE / 2 }]}>
          <View style={[styles.ringMid, { width: HERO_SIZE * 0.82, height: HERO_SIZE * 0.82, borderRadius: (HERO_SIZE * 0.82) / 2 }]}>
            <View style={[styles.ringInner, { width: HERO_SIZE * 0.64, height: HERO_SIZE * 0.64, borderRadius: (HERO_SIZE * 0.64) / 2 }]}>
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: HERO_SIZE * 0.38, height: HERO_SIZE * 0.38 }}
                resizeMode="contain"
                accessibilityLabel="Eye Care illustration"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Copy & CTAs */}
      <View style={styles.bottom}>
        <Text style={styles.title}>{t('welcome.tagline')}</Text>
        <Text style={styles.tagline}>{t('welcome.subtitle')}</Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/(auth)/signup')}
          accessibilityLabel={t('welcome.getStarted')}
          accessibilityRole="button"
        >
          <Text style={styles.btnPrimaryText}>{t('welcome.getStarted')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/(auth)/login')}
          accessibilityLabel={t('welcome.signIn')}
          accessibilityRole="button"
        >
          <Text style={styles.btnSecondaryText}>
            {t('welcome.alreadyHaveAccount')}{' '}
            <Text style={{ color: '#1a73e8', fontWeight: '600' }}>{t('welcome.signIn')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // ── Logo ──────────────────────────────────────────────────────────────────
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
  },
  // Real logo image — uncomment <Image> above and set this when logo.png lands
  logo: {
    width: 140,
    height: 44,
  },
  // Text wordmark — remove once logo.png is in place
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordmarkIcon: {
    fontSize: 22,
  },
  wordmarkText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  wordmarkAccent: {
    color: '#1a73e8',
  },
  // ── Hero ──────────────────────────────────────────────────────────────────
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMid: {
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    backgroundColor: '#1a73e8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 40,
    lineHeight: 24,
  },
  btnPrimary: {
    backgroundColor: '#1a73e8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  btnSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});
