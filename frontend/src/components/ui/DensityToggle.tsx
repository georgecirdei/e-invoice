'use client';

import React from 'react';
import { useDensity } from '@/contexts/DensityContext';
import { Button } from './Button';

export function DensityToggle() {
  const { mode, setMode } = useDensity();

  const modes = [
    { key: 'regular' as const, label: 'Regular', icon: '🟢', desc: 'Standard spacing' },
    { key: 'compact' as const, label: 'Compact', icon: '🟡', desc: 'Reduced spacing' },
    { key: 'ultra' as const, label: 'Ultra', icon: '🔴', desc: 'Maximum density' },
  ];

  return (
    <div className="relative group">
      <Button 
        size="sm" 
        variant="outline" 
        className="dense-flex"
        title="Density Mode"
      >
        {modes.find(m => m.key === mode)?.icon} {mode}
      </Button>
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-1 w-48 bg-popover rounded shadow-lg py-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 border border-border">
        <div className="px-2 py-1 border-b">
          <span className="compact-text-xs font-medium text-muted-foreground">Information Density</span>
        </div>
        {modes.map((modeOption) => (
          <button
            key={modeOption.key}
            onClick={() => setMode(modeOption.key)}
            className={`block w-full text-left px-2 py-1 compact-text-xs hover:bg-accent transition-colors ${
              mode === modeOption.key ? 'bg-accent/50 font-medium' : ''
            }`}
          >
            <div className="dense-flex justify-between">
              <div className="dense-flex">
                <span>{modeOption.icon}</span>
                <span>{modeOption.label}</span>
              </div>
              {mode === modeOption.key && <span>✓</span>}
            </div>
            <div className="compact-text-xs text-muted-foreground mt-0.5">
              {modeOption.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
