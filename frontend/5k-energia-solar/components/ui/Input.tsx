import React from 'react';

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({ label, name, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm text-slate-500 mb-1 font-bold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="px-3 py-2 border text-slate-700 border-slate-200 bg-white rounded-lg focus:ring-transparent focus:border-blue-500 shadow-xs"
      />
    </div>
  );
};

export default Input;