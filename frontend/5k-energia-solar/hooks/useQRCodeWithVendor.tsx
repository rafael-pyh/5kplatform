import { useEffect, useState } from 'react';
import { addVendorNameToQRCode } from '../lib/composePoster';

export default function useQRCodeWithVendor(qrCodeBase64: string, vendorName?: string) {
  const [qrCodeWithVendor, setQrCodeWithVendor] = useState<string>(qrCodeBase64);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const generateQRWithVendor = async () => {
      console.log('[useQRCodeWithVendor] Hook iniciado');
      console.log('[useQRCodeWithVendor] vendorName:', vendorName);
      console.log('[useQRCodeWithVendor] qrCodeBase64 existe?', !!qrCodeBase64);
      console.log('[useQRCodeWithVendor] qrCodeBase64 tamanho:', qrCodeBase64?.length ?? 0);
      
      if (!vendorName) {
        console.log('[useQRCodeWithVendor] Sem vendor name, usando QR code original');
        if (mounted) setQrCodeWithVendor(qrCodeBase64);
        return;
      }

      try {
        setLoading(true);
        console.log('[useQRCodeWithVendor] Adicionando vendor name ao QR code...');
        const qrWithName = await addVendorNameToQRCode(qrCodeBase64, vendorName);
        console.log('[useQRCodeWithVendor] QR code com vendor name criado, tamanho:', qrWithName?.length ?? 0);
        if (mounted) {
          setQrCodeWithVendor(qrWithName);
        }
      } catch (error) {
        console.error('[useQRCodeWithVendor] Erro ao adicionar nome ao QR code:', error);
        if (mounted) setQrCodeWithVendor(qrCodeBase64);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    generateQRWithVendor();

    return () => {
      mounted = false;
    };
  }, [qrCodeBase64, vendorName]);

  return { qrCodeWithVendor, loading };
}
