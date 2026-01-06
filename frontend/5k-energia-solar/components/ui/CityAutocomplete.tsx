'use client';

import { useState, useEffect, useRef } from 'react';

interface CityAutocompleteProps {
  cities: Array<{ id: string; name: string }>;
  value: string;
  onChange: (cityName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CityAutocomplete({
  cities,
  value,
  onChange,
  placeholder = 'Selecione uma cidade',
  disabled = false,
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState(value);
  const [filteredCities, setFilteredCities] = useState(cities);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update filtered cities when filter value changes
  useEffect(() => {
    const filtered = cities.filter((city) =>
      city.name.toLowerCase().includes(filterValue.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [filterValue, cities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelectCity = (cityName: string) => {
    onChange(cityName);
    setFilterValue(cityName);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setFilterValue('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={filterValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        autoComplete="off"
      />

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelectCity(city.name)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm transition-colors"
              >
                {city.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">Nenhuma cidade encontrada</div>
          )}
        </div>
      )}
    </div>
  );
}
