'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { updateProfileAction } from '../app/actions/profile';
import { Person } from '../lib/types';
import api from '../lib/api';
import { getCitiesByState } from '../lib/actions/locationActions';

type FormData = {
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  photoBase64: string;
  city: string;
  state: string;
};

interface CityOption {
  id: string;
  name: string;
}

export function useEditProfile(seller: Person | null) {
  const router = useRouter();
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    pixKey: '',
    photoBase64: '',
    city: '',
    state: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Buscar perfil completo quando o seller estiver disponível
  useEffect(() => {
    const fetchProfile = async () => {
      if (!seller?.id) return;

      setProfileLoading(true);
      try {
        const fullProfile = await api.get<any>(`/seller/${seller.id}`);
        const profileData = fullProfile.data?.data;

        if (profileData) {
          // Try to find the state abbreviation if the current value is a full name
          let stateValue = profileData.state || '';
          if (stateValue && states.length > 0) {
            // Check if it's already an abbreviation
            const isAbbreviation = states.includes(stateValue);
            if (!isAbbreviation) {
              // For now, we'll keep the value as is since we don't have state names here
              // The conversion will happen when states are loaded
            }
          }

          // Convert photoBase64 to data URL if it's base64, otherwise keep as URL
          let photoBase64Value = profileData.photoBase64 || '';
          if (photoBase64Value.includes('[Foto')) {
            // It's a placeholder, set to empty
            photoBase64Value = '';
          } else if (photoBase64Value && !photoBase64Value.includes('data:') && !photoBase64Value.startsWith('http')) {
            // Assume it's base64 string without data URL prefix
            photoBase64Value = `data:image/jpeg;base64,${photoBase64Value}`;
          }

          const initialData: FormData = {
            name: profileData.name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            pixKey: profileData.pixKey || '',
            photoBase64: photoBase64Value,
            city: profileData.city || '',
            state: stateValue,
          };
          setOriginalData(initialData);
          setFormData(initialData);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil completo:', error);
        toast.error('Erro ao carregar dados do perfil');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [seller?.id, states]);

  // Buscar estados da API
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get<any>('/person/states');
        if (response.data?.data) {
          setStates(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao buscar estados:', error);
        // Fallback para estados estáticos
        setStates(['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']);
      } finally {
        setStatesLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    const loadCities = async () => {
      if (!formData.state) {
        setCities([]);
        return;
      }

      setCitiesLoading(true);
      try {
        const citiesData = await getCitiesByState(formData.state);
        setCities(citiesData);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        toast.error('Erro ao carregar cidades');
      } finally {
        setCitiesLoading(false);
      }
    };

    loadCities();
  }, [formData.state]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    const newValue = name === 'phone' ? value.replace(/\D/g, '') : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Verificar se houve mudanças
    if (originalData) {
      const changed = Object.keys(formData).some(
        (key) => formData[key as keyof FormData] !== originalData[key as keyof FormData]
      );
      setHasChanges(changed);
    }
  }, [originalData, formData]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photoBase64: reader.result as string }));
      
      // Verificar se houve mudanças
      if (originalData && originalData.photoBase64 !== reader.result) {
        setHasChanges(true);
      }
    };
    reader.readAsDataURL(file);
  }, [originalData]);

  const validateForm = useCallback((data: FormData) => {
    if (!data.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) { toast.error('Email é obrigatório'); return false; }
    if (!emailRegex.test(data.email)) { toast.error('Email inválido'); return false; }
    if (!data.phone.trim()) { toast.error('Telefone é obrigatório'); return false; }
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(data.phone)) { toast.error('Telefone inválido. Insira apenas 10 ou 11 dígitos numéricos.'); return false; }
    if (!data.pixKey.trim()) { toast.error('Chave PIX é obrigatória'); return false; }
    if (!data.city.trim()) { toast.error('Cidade é obrigatória'); return false; }
    if (!data.state) { toast.error('Estado é obrigatório'); return false; }
    return true;
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!seller?.id) {
      toast.error('ID do vendedor não encontrado');
      return;
    }
    if (!validateForm(formData)) return;
    setIsLoading(true);
    try {
      // Enviar apenas os campos que foram alterados
      const dataToUpdate: Partial<FormData> = {};
      
      if (originalData) {
        Object.keys(formData).forEach((key) => {
          if (formData[key as keyof FormData] !== originalData[key as keyof FormData]) {
            dataToUpdate[key as keyof FormData] = formData[key as keyof FormData];
          }
        });
      } else {
        // Se não há dados originais, enviar tudo
        Object.assign(dataToUpdate, formData);
      }

      // Process photoBase64 to remove data URL prefix if present
      if (dataToUpdate.photoBase64 && typeof dataToUpdate.photoBase64 === 'string' && dataToUpdate.photoBase64.includes('data:')) {
        const base64Data = dataToUpdate.photoBase64.split(',')[1];
        if (base64Data) {
          dataToUpdate.photoBase64 = base64Data;
        }
      }

      await updateProfileAction(seller.id, dataToUpdate as any);
      toast.success('Perfil atualizado com sucesso!');
      setHasChanges(false);
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      let errorMessage = 'Erro ao atualizar perfil.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, router, seller?.id, originalData]);

  return {
    states,
    cities,
    statesLoading,
    citiesLoading,
    formData,
    setFormData,
    handleChange,
    handleFileChange,
    handleSubmit,
    isLoading,
    hasChanges,
    profileLoading,
  } as const;
}
