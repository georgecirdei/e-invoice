'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type DensityMode = 'regular' | 'compact' | 'ultra';

interface DensityContextType {
  mode: DensityMode;
  setMode: (mode: DensityMode) => void;
  isCompact: boolean;
  isUltra: boolean;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DensityMode>('ultra'); // Default to ultra

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('density-mode') as DensityMode;
    if (saved && ['regular', 'compact', 'ultra'].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  // Save to localStorage when changed
  const setMode = (newMode: DensityMode) => {
    setModeState(newMode);
    localStorage.setItem('density-mode', newMode);
  };

  // Apply density classes to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('density-regular', 'density-compact', 'density-ultra');
    root.classList.add(`density-${mode}`);
  }, [mode]);

  const value = {
    mode,
    setMode,
    isCompact: mode === 'compact',
    isUltra: mode === 'ultra',
  };

  return (
    <DensityContext.Provider value={value}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (context === undefined) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}
