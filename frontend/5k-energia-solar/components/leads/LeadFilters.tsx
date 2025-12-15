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
    month?: string;
    year?: string;
  };
  onAdditionalFiltersChange: (filters: {
    name: string;
    city: string;
    state: string;
    status: string;
    month?: string;
    year?: string;
  }) => void;
  cities: string[];
  states: string[];
  years?: string[];
  className?: string;
}

function LeadFilters({
  additionalFilters,
  onAdditionalFiltersChange,
  cities,
  states,
  years,
  className,
}: LeadFiltersProps) {
  const [nameFilter, setNameFilter] = useState(additionalFilters.name);
  const [month, setMonth] = useState(additionalFilters.month || '');
  const [year, setYear] = useState(additionalFilters.year || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onAdditionalFiltersChange({ ...additionalFilters, name: nameFilter, month, year });
    }, 300);

    return () => clearTimeout(timeout);
  }, [nameFilter, month, year, additionalFilters, onAdditionalFiltersChange]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onAdditionalFiltersChange({ ...additionalFilters, [name]: value });
  };

  return (
    <div className={cn('space-y-4 mb-2 w-full', className)}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
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
        <Select
          label="Mês"
          name="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </Select>
        <Select
          label="Ano"
          name="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Todos</option>
          {(years && years.length > 0 ? years : Array.from({ length: 6 }).map((_, idx) => String(new Date().getFullYear() - idx))).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default memo(LeadFilters);