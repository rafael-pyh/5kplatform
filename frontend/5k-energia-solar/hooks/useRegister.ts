'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { registerAction } from '../app/actions/register';
import api from '../lib/api';
import { getStates, getCitiesByState } from '@/lib/actions/locationActions';

interface StateOption {
  id: string;
  name: string;
  abbreviation: string;
}

interface CityOption {
  id: string;
  name: string;
}

type FormData = {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
  phone: string;
  pixKey: string;
  photoBase64: string;
  city: string;
  state: string;
};

export function useRegister(initial: Partial<FormData> = {}) {
  const router = useRouter();
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
    phone: '',
    pixKey: '',
    photoBase64: '',
    city: '',
    state: '',
    ...initial,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Buscar estados da API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const statesData = await getStates();
        setStates(statesData);
      } catch (error) {
        console.error('Erro ao buscar estados:', error);
        toast.error('Erro ao carregar estados');
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Buscar cidades quando estado muda
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) {
        setCities([]);
        return;
      }

      setCitiesLoading(true);
      try {
        const citiesData = await getCitiesByState(formData.state);
        setCities(citiesData);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        toast.error('Erro ao carregar cidades');
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [formData.state]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    const newValue = name === 'phone' ? value.replace(/\D/g, '') : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photoBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const validateForm = useCallback((data: FormData) => {
    if (!data.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) { toast.error('Email é obrigatório'); return false; }
    if (!emailRegex.test(data.email)) { toast.error('Email inválido'); return false; }
    if (!data.password) { toast.error('Senha é obrigatória'); return false; }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(data.password)) { toast.error('Senha deve ter no mínimo 8 caracteres, incluindo letras e números'); return false; }
    if (data.password !== data.repeatPassword) { toast.error('As senhas não coincidem'); return false; }
    if (!data.phone.trim()) { toast.error('Telefone é obrigatório'); return false; }
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(data.phone)) { toast.error('Telefone inválido. Insira apenas 10 ou 11 dígitos numéricos.'); return false; }
    if (!data.pixKey.trim()) { toast.error('Chave PIX é obrigatória'); return false; }
    if (!data.city.trim()) { toast.error('Cidade é obrigatória'); return false; }
    if (!data.state) { toast.error('Estado é obrigatório'); return false; }
    if (!data.photoBase64) { toast.error('Foto é obrigatória'); return false; }
    return true;
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!validateForm(formData)) return;
    setIsLoading(true);
    try {
      await registerAction(formData as any);
      toast.success('Registro criado com sucesso! QR Code gerado.');
      
      // Limpar o formulário
      setFormData({
        name: '',
        email: '',
        password: '',
        repeatPassword: '',
        phone: '',
        pixKey: '',
        photoBase64: '',
        city: '',
        state: '',
      });
      
      router.push('/login');
    } catch (error: any) {
      console.error('Erro ao criar registro:', error);
      
      // Extrai a mensagem de erro de várias formas possíveis
      let errorMessage = 'Erro ao criar registro.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Exibe a mensagem apropriada baseada no tipo de erro
      if (errorMessage.includes('já existe') || errorMessage.includes('cadastrado') || errorMessage.includes('Email')) {
        toast.error('Usuário já existe. Faça login para continuar.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, router]);

  return {
    states,
    statesLoading,
    cities,
    citiesLoading,
    formData,
    setFormData,
    handleChange,
    handleFileChange,
    handleSubmit,
    isLoading,
  } as const;
}
