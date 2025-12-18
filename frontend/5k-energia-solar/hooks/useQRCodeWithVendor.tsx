import { useEffect, useState } from 'react';
import { addVendorNameToQRCode } from '../lib/composePoster';

export default function useQRCodeWithVendor(qrCodeBase64: string, vendorName?: string) {
  const [qrCodeWithVendor, setQrCodeWithVendor] = useState<string>(qrCodeBase64);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const generateQRWithVendor = async () => {
      if (!vendorName) {
        if (mounted) setQrCodeWithVendor(qrCodeBase64);
        return;
      }

      try {
        setLoading(true);
        const qrWithName = await addVendorNameToQRCode(qrCodeBase64, vendorName);
        if (mounted) {
          setQrCodeWithVendor(qrWithName);
        }
      } catch (error) {
        console.error('Erro ao adicionar nome ao QR code:', error);
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
