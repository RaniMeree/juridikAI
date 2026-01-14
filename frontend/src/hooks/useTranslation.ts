/**
 * Translation hook - easy way to use translations
 * Usage: const { t } = useTranslation();
 *        <Text>{t('auth.login')}</Text>
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import i18n, { supportedLanguages } from '@/i18n';

export const useTranslation = () => {
  const { t, i18n: i18nInstance } = useI18nTranslation();

  // Change language
  const changeLanguage = async (langCode: string) => {
    await i18nInstance.changeLanguage(langCode);
  };

  // Get current language
  const currentLanguage = i18nInstance.language;

  // Get language info
  const currentLanguageInfo = supportedLanguages.find(
    (lang) => lang.code === currentLanguage
  );

  return {
    t,
    changeLanguage,
    currentLanguage,
    currentLanguageInfo,
    supportedLanguages,
  };
};

export default useTranslation;
