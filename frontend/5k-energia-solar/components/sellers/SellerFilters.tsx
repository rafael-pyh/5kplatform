'use client';

import { memo, useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import BottomSheet from '@/components/ui/BottomSheet';
import { Button } from '../ui';

interface SellerFiltersProps {
  additionalFilters: {
    name: string;
    city: string;
    state: string;
    status: string;
    role: string;
    month?: string;
    year?: string;
  };
  onAdditionalFiltersChange: (filters: {
    name: string;
    city: string;
    state: string;
    status: string;
    role: string;
    month?: string;
    year?: string;
  }) => void;
  cities: string[];
  states: string[];
  years?: string[];
}

function SellerFilters({
  additionalFilters,
  onAdditionalFiltersChange,
  cities,
  states,
  years,
}: SellerFiltersProps) {
  const [nameFilter, setNameFilter] = useState(additionalFilters.name);
  const [month, setMonth] = useState(additionalFilters.month || '');
  const [year, setYear] = useState(additionalFilters.year || '');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(additionalFilters);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onAdditionalFiltersChange({ ...additionalFilters, name: nameFilter, month, year });
    }, 300); // Apply filter after 300ms debounce

    return () => clearTimeout(timeout);
  }, [nameFilter, month, year, additionalFilters, onAdditionalFiltersChange]);

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
      role: 'all',
      month: '',
      year: '',
    };
    setTempFilters(resetFilters);
    onAdditionalFiltersChange(resetFilters);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Desktop Filters */}
      <div className="hidden md:grid grid-cols-7 gap-4">
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
          label="Status"
          name="status"
          value={additionalFilters.status}
          onChange={handleSelectChange}
        >
          <option value="all">Todos</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </Select>
        <Select
          label="Cargo"
          name="role"
          value={additionalFilters.role}
          onChange={handleSelectChange}
        >
          <option value="all">Todos</option>
          <option value="SELLER">Vendedor</option>
          <option value="AFFILIATE">Afiliado</option>
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
          variant='outline-blue'
          className='w-full flex gap-2 justify-center'
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <p>Filtros</p>
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
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Status"
              name="status"
              value={tempFilters.status}
              onChange={handleMobileSelectChange}
            >
              <option value="all">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </Select>
            <Select
              label="Cargo"
              name="role"
              value={tempFilters.role}
              onChange={handleMobileSelectChange}
            >
              <option value="all">Todos</option>
              <option value="SELLER">Vendedor</option>
              <option value="AFFILIATE">Afiliado</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={resetMobileFilters}
              variant='outline-danger'
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Limpar
            </Button>
            <Button
              onClick={applyMobileFilters}
              variant='gradient'
              className="font-semibold"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export default memo(SellerFilters);
