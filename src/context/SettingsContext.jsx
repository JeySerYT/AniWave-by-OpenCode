import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const PARTICLES_KEY = 'particles_type';

export function SettingsProvider({ children }) {
  const [particlesType, setParticlesType] = useState(() => {
    try {
      return localStorage.getItem(PARTICLES_KEY) || 'sakura';
    } catch {
      return 'sakura';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PARTICLES_KEY, particlesType);
    } catch {}
  }, [particlesType]);

  return (
    <SettingsContext.Provider value={{ particlesType, setParticlesType }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
