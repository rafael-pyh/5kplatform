"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { createLeadFromQR, scanQRCode } from '@/app/actions/lead';

export type LeadFormData = {
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  city?: string;
  state?: string;
};

export default function useNewLeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrCode = searchParams.get('qr');

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [sellerName, setSellerName] = useState<string>('');
  const [energyBill, setEnergyBill] = useState<string>('');
  const [roofPhoto, setRoofPhoto] = useState<string>('');

  const methods = useForm<LeadFormData>();

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

    if (!data.email && !data.phone) {
      toast.error('Por favor, forneça pelo menos um meio de contato (email ou telefone)');
      return;
    }

    const maxBase64Size = 2 * 1024 * 1024; // 2MB approx
    if (energyBill && energyBill.length > maxBase64Size) {
      toast.error('Foto da conta de energia muito grande. Por favor, selecione uma imagem menor.');
      return;
    }
    if (roofPhoto && roofPhoto.length > maxBase64Size) {
      toast.error('Foto do telhado muito grande. Por favor, selecione uma imagem menor.');
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
        city: data.city || undefined,
        state: data.state || undefined,
      };

      const response = await createLeadFromQR(qrCode, leadData);

      if (!response.success) {
        toast.error(response.error || 'Erro ao enviar cadastro');
        return;
      }

      router.push('/lead/success');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    methods,
    isLoading,
    isValidating,
    sellerName,
    energyBill,
    setEnergyBill,
    roofPhoto,
    setRoofPhoto,
    onSubmit,
  };
}
