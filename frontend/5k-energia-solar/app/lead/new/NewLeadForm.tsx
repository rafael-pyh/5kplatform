'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/ImageUpload';
import { createLeadFromQR, scanQRCode } from '@/app/actions/lead';

interface LeadFormData {
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
}

export default function NewLeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrCode = searchParams.get('qr');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [sellerName, setSellerName] = useState<string>('');
  const [energyBill, setEnergyBill] = useState<string>('');
  const [roofPhoto, setRoofPhoto] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>();

  // Validar QR Code ao carregar a página
  useEffect(() => {
    const validateQR = async () => {
      if (!qrCode) {
        toast.error('QR Code não fornecido');
        router.push('/');
        return;
      }

      const result = await scanQRCode(qrCode);
      
      if (!result.success) {
        toast.error(result.error || 'QR Code inválido');
        router.push('/');
        return;
      }

      setSellerName(result.data?.personName || '');
      setIsValidating(false);
    };

    validateQR();
  }, [qrCode, router]);

  const onSubmit = async (data: LeadFormData) => {
    if (!qrCode) {
      toast.error('QR Code inválido');
      return;
    }

    // Validar se pelo menos um campo de contato foi preenchido
    if (!data.email && !data.phone) {
      toast.error('Por favor, forneça pelo menos um meio de contato (email ou telefone)');
      return;
    }

    setIsLoading(true);

    try {
      const leadData: LeadFormData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        energyBill: energyBill || undefined,
        roofPhoto: roofPhoto || undefined,
      };

      const response = await createLeadFromQR(qrCode, leadData);

      if (!response.success) {
        toast.error(response.error || 'Erro ao enviar cadastro');
        return;
      }

      // Redirecionar para página de sucesso
      router.push('/lead/success');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-transparent to-green-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Validando QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-transparent to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 via-blue-400 to-green-500 rounded-xl mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">5K Energia Solar</h1>
            <p className="text-gray-600 mt-2">
              Cadastro de interesse - Vendedor: <span className="font-semibold">{sellerName}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome completo */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'Nome deve ter no mínimo 3 caracteres',
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="João da Silva"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone', {
                  pattern: {
                    value: /^[\d\s\(\)\-\+]+$/,
                    message: 'Telefone inválido',
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="(11) 98765-4321"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                * Forneça pelo menos um meio de contato (email ou telefone)
              </p>
            </div>

            {/* Conta de energia */}
            <ImageUpload
              label="Foto da conta de energia (opcional)"
              value={energyBill}
              onChange={setEnergyBill}
            />

            {/* Foto do telhado */}
            <ImageUpload
              label="Foto do telhado (opcional)"
              value={roofPhoto}
              onChange={setRoofPhoto}
            />

            {/* Informação de privacidade */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>🔒 Seus dados estão seguros:</strong> As informações fornecidas serão
                utilizadas apenas para entrar em contato sobre a instalação de energia solar.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-blue-500 via-blue-400 to-green-500 text-white py-4 rounded-lg font-medium text-lg hover:from-blue-600 hover:via-blue-500 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {isLoading ? 'Enviando...' : 'Enviar cadastro'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 5K Energia Solar - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
