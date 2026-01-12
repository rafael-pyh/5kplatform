import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, name, value, onChange, children, className }) => {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={name} className="text-sm text-slate-500 mb-1 font-bold">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="h-full pl-3 pr-4 py-2 border text-slate-700 border-slate-200 bg-white rounded-lg focus:ring-transparent focus:border-blue-500 shadow-xs appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/></svg>")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.4rem center',
          backgroundSize: '1rem',
        }}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;