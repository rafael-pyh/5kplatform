'use client';

import React from 'react';

interface SliderControlProps {
  label: string;
  min: number;
  max: number;
  step?: number | string;
  value: number | string;
  onChange: (v: number) => void;
  display?: string | number;
}

export default function SliderControl({ label, min, max, step = 1, value, onChange, display }: SliderControlProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600 whitespace-nowrap">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step as any}
        value={value as any}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="text-xs text-gray-500 w-8 text-right">{display ?? value}</span>
    </div>
  );
}
