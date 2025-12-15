 'use client';

import { memo, useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils/cn';

interface LeadFiltersProps {
  additionalFilters: {
    name: string;
    city: string;
    state: string;
    status: string;
  };
  onAdditionalFiltersChange: (filters: {
    name: string;
    city: string;
    state: string;
    status: string;
  }) => void;
  cities: string[];
  states: string[];
  className?: string;
}

function LeadFilters({
  additionalFilters,
  onAdditionalFiltersChange,
  cities,
  states,
  className,
}: LeadFiltersProps) {
  const [nameFilter, setNameFilter] = useState(additionalFilters.name);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onAdditionalFiltersChange({ ...additionalFilters, name: nameFilter });
    }, 300);

    return () => clearTimeout(timeout);
  }, [nameFilter, additionalFilters, onAdditionalFiltersChange]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onAdditionalFiltersChange({ ...additionalFilters, [name]: value });
  };

  return (
    <div className={cn('space-y-4 mb-2 w-full', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <Input
          label="Nome"
          name="name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Filtrar por nome"
        />
        <Select
          label="Cidade"
          name="city"
          value={additionalFilters.city}
          onChange={handleSelectChange}
        >
          <option value="">Todas</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
        <Select
          label="Estado"
          name="state"
          value={additionalFilters.state}
          onChange={handleSelectChange}
        >
          <option value="">Todos</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default memo(LeadFilters);