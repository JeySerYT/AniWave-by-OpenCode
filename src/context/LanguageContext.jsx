import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

const LANGUAGE_KEY = 'app_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return stored || 'ru';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'ru' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['ru'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
