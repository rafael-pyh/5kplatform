 'use client';

import { memo, useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BottomSheet from '@/components/ui/BottomSheet';
import { cn } from '@/lib/utils/cn';
import { Button } from '../ui';

interface LeadFiltersProps {
  additionalFilters: {
    name: string;
    city: string;
    state: string;
    status: string;
    owner?: string;
    month?: string;
    year?: string;
  };
  onAdditionalFiltersChange: (filters: {
    name: string;
    city: string;
    state: string;
    status: string;
    owner?: string;
    month?: string;
    year?: string;
  }) => void;
  cities: string[];
  states: string[];
  years?: string[];
  sellers?: { id: string; name: string }[];
  className?: string;
}

function LeadFilters({
  additionalFilters,
  onAdditionalFiltersChange,
  cities,
  states,
  years,
  sellers,
  className,
}: LeadFiltersProps) {
  const [nameFilter, setNameFilter] = useState(additionalFilters.name);
  const [owner, setOwner] = useState(additionalFilters.owner || '');
  const [month, setMonth] = useState(additionalFilters.month || '');
  const [year, setYear] = useState(additionalFilters.year || '');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(additionalFilters);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onAdditionalFiltersChange({ ...additionalFilters, name: nameFilter, owner, month, year });
    }, 300);

    return () => clearTimeout(timeout);
  }, [nameFilter, owner, month, year, additionalFilters, onAdditionalFiltersChange]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onAdditionalFiltersChange({ ...additionalFilters, [name]: value });
  };

  const handleMobileSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempFilters({ ...tempFilters, [name]: value });
  };

  const handleMobileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempFilters({ ...tempFilters, name: e.target.value });
  };

  const handleMobileOwnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempFilters({ ...tempFilters, owner: e.target.value });
  };

  const handleMobileMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempFilters({ ...tempFilters, month: e.target.value });
  };

  const handleMobileYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempFilters({ ...tempFilters, year: e.target.value });
  };

  const applyMobileFilters = () => {
    onAdditionalFiltersChange(tempFilters);
    setIsBottomSheetOpen(false);
  };

  const resetMobileFilters = () => {
    const resetFilters = {
      name: '',
      city: '',
      state: '',
      status: 'all',
      owner: '',
      month: '',
      year: '',
    };
    setTempFilters(resetFilters);
    onAdditionalFiltersChange(resetFilters);
  };

  return (
    <div className={cn('space-y-4 mb-2 w-full', className)}>
      {/* Desktop Filters */}
      <div className="hidden md:grid grid-cols-6 gap-2 w-full">
        <Input
          label="Nome"
          name="name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          placeholder="Filtrar por nome"
        />
        <Select
          label="Vendedor"
          name="owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        >
          <option value="">Todos</option>
          {sellers && sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
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

      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <Button
          onClick={() => {
            setTempFilters(additionalFilters);
            setIsBottomSheetOpen(true);
          }}
          variant="outline-blue"
          className="w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filtros
        </Button>
      </div>

      {/* Bottom Sheet for Mobile Filters */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Filtros"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            name="name"
            value={tempFilters.name}
            onChange={handleMobileNameChange}
            placeholder="Filtrar por nome"
          />
          <Select
            label="Vendedor"
            name="owner"
            value={tempFilters.owner || ''}
            onChange={handleMobileOwnerChange}
          >
            <option value="">Todos</option>
            {sellers && sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select
            label="Cidade"
            name="city"
            value={tempFilters.city}
            onChange={handleMobileSelectChange}
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
            value={tempFilters.state}
            onChange={handleMobileSelectChange}
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
            value={tempFilters.month || ''}
            onChange={handleMobileMonthChange}
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
            value={tempFilters.year || ''}
            onChange={handleMobileYearChange}
          >
            <option value="">Todos</option>
            {(years && years.length > 0 ? years : Array.from({ length: 6 }).map((_, idx) => String(new Date().getFullYear() - idx))).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={resetMobileFilters}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Limpar
            </button>
            <button
              onClick={applyMobileFilters}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Aplicar
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export default memo(LeadFilters);