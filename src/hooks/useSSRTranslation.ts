'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SSRTranslationHook {
  t: (key: string, options?: any) => string;
  ready: boolean;
  language: string;
  isHydrated: boolean;
}

export const useSSRTranslation = (): SSRTranslationHook => {
  const { t, i18n, ready } = useTranslation();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after client-side hydration
    setIsHydrated(true);
    
    // Always ensure pt-BR is set as default, especially in private windows
    if (ready) {
      if (!i18n.language || i18n.language === 'dev' || i18n.language === 'en' || i18n.language === 'en-US') {
        i18n.changeLanguage('pt-BR');
      }
    }
  }, [ready, i18n]);

  return {
    t,
    ready: ready && isHydrated,
    language: i18n.language || 'pt-BR',
    isHydrated
  };
};