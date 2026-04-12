'use client';

import currentLanguage from '@/utils/currentLanguage';
import { NextIntlClientProvider } from 'next-intl';

const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const language = currentLanguage();

  try {
    const messages = require(`../lib/i18n/locales/${language}.json`);
    return (
      <NextIntlClientProvider locale={language} messages={messages}>
        {children}
      </NextIntlClientProvider>
    );
  } catch {
    return null;
  }
};

export default TranslationProvider;
