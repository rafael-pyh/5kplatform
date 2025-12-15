import React from 'react';

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, name, value, onChange, children }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm text-slate-500 mb-1 font-bold">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="h-full px-3 py-2 border text-slate-700 border-slate-200 bg-white rounded-lg focus:ring-transparent focus:border-blue-500 shadow-xs"
      >
        {children}
      </select>
    </div>
  );
};

export default Select;