import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, type SupportedLanguage } from '@/i18n';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = i18n.language as SupportedLanguage;

  const handleSelect = (code: SupportedLanguage) => {
    if (code !== current) i18n.changeLanguage(code);
  };

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Select language">
      {LANGUAGES.map((lang, idx) => {
        const isActive = lang.code === current;
        const isFirst = idx === 0;
        const isLast = idx === LANGUAGES.length - 1;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.pill,
              isActive && styles.pillActive,
              isFirst && styles.pillFirst,
              isLast && styles.pillLast,
            ]}
            onPress={() => handleSelect(lang.code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            accessibilityLabel={lang.label}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {lang.nativeLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderLeftColor: '#d1d5db',
  },
  pillFirst: {
    borderLeftWidth: 0,
  },
  pillLast: {},
  pillActive: {
    backgroundColor: '#1a73e8',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  pillTextActive: {
    color: '#ffffff',
  },
});
