'use client';

import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import PasswordField from '@/components/ui/PasswordField';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { getStates, getCitiesByState } from '@/lib/actions/locationActions';
import { Button } from '../ui';

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
}

interface StateOption {
  id: string;
  name: string;
  abbreviation: string;
}

interface CityOption {
  id: string;
  name: string;
}

type Props = {
  form: UseFormReturn<SetPasswordForm>;
  verifying: boolean;
  sellerInfo: any;
  onSubmit: (data: SetPasswordForm) => Promise<void> | void;
};

export default function VerifyEmailForm({ form, verifying, sellerInfo, onSubmit }: Props) {
  const { register, formState: { errors }, handleSubmit, setValue } = form;
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Buscar estados da API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await getStates();
        setStates(statesData);
      } catch (error) {
        console.error('Erro ao buscar estados:', error);
      }
    };

    fetchStates();
  }, []);

  // Buscar cidades quando estado muda
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) {
        setCities([]);
        setSelectedCity('');
        return;
      }

      try {
        const citiesData = await getCitiesByState(selectedState);
        setCities(citiesData);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      }
    };

    fetchCities();
  }, [selectedState]);

  // Atualizar valores no form quando os estados locais mudam
  useEffect(() => {
    setValue('state', selectedState);
  }, [selectedState, setValue]);

  useEffect(() => {
    setValue('city', selectedCity);
  }, [selectedCity, setValue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-green-500 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Email Verificado!</h1>
          <p className="text-gray-600 mt-2">
            Olá, <strong>{sellerInfo?.name}</strong>! Agora defina sua senha para acessar sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
            <PasswordField
              name="password"
              register={register as any}
              registerOptions={{
                required: 'Senha é obrigatória',
                minLength: { value: 8, message: 'Senha deve ter no mínimo 8 caracteres, incluindo letras e números' },
              }}
              placeholder="******"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
            <PasswordField
              name="confirmPassword"
              register={register as any}
              registerOptions={{
                required: 'Confirmação de senha é obrigatória',
                validate: (value: string) => value === (form.getValues('password') || '') || 'As senhas não coincidem',
              }}
              placeholder="******"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select
              id="state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um estado</option>
              {states.map((state) => (
                <option key={state.id} value={state.abbreviation}>
                  {state.name}
                </option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
            <CityAutocomplete
              cities={cities}
              value={selectedCity}
              onChange={(cityName) => {
                setSelectedCity(cityName);
              }}
              placeholder="Selecione uma cidade"
              disabled={!selectedState}
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
          </div>



          <Button type="submit" disabled={verifying} variant="gradient">{verifying ? 'Ativando conta...' : 'Ativar Conta'}</Button>
        </form>
      </div>
    </div>
  );
}
