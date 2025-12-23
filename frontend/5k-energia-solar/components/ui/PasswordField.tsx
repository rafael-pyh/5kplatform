import React, { useState } from 'react';
import { Icon } from './Icon';

interface PasswordFieldProps {
  id?: string;
  name: string;
  placeholder?: string;
  className?: string;
  // react-hook-form register function (optional)
  register?: (name: string, options?: any) => any;
  registerOptions?: any;
  // controlled props (optional)
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | boolean;
}

export default function PasswordField({
  id,
  name,
  placeholder,
  className,
  register,
  registerOptions,
  value,
  onChange,
  error,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  const registerProps = register ? register(name, registerOptions) : {};

  return (
    <div className="relative">
      <input
        id={id || name}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...registerProps}
        className={
          (className || 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent') +
          ' pr-10'
        }
      />

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {show ? (
          <Icon icon="bi:eye-slash" className="w-5 h-5 mr-2" />
        ) : (
          <Icon icon="bi:eye" className="w-5 h-5 mr-2" />
        )}
      </button>

      {error && typeof error === 'string' && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
