import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const PARTICLES_KEY = 'particles_type';
const ROTATE_KEY = 'auto_rotate';

export function SettingsProvider({ children }) {
  const [particlesType, setParticlesType] = useState(() => {
    try {
      return localStorage.getItem(PARTICLES_KEY) || 'sakura';
    } catch {
      return 'sakura';
    }
  });

  const [autoRotate, setAutoRotate] = useState(() => {
    try {
      const val = localStorage.getItem(ROTATE_KEY);
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PARTICLES_KEY, particlesType);
    } catch {}
  }, [particlesType]);

  useEffect(() => {
    try {
      localStorage.setItem(ROTATE_KEY, String(autoRotate));
    } catch {}
  }, [autoRotate]);

  return (
    <SettingsContext.Provider value={{ particlesType, setParticlesType, autoRotate, setAutoRotate }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
