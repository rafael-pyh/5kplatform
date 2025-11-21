'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface SellerQRCodeCardProps {
  qrCodeUrl: string;
  sellerName: string;
  qrCode: string;
}

type Resolution = {
  label: string;
  size: number;
};

const resolutions: Resolution[] = [
  { label: 'Baixa (512px)', size: 512 },
  { label: 'Média (1024px)', size: 1024 },
  { label: 'Alta (2048px)', size: 2048 },
  { label: 'Original', size: 0 },
];

export default function SellerQRCodeCard({ qrCodeUrl, sellerName, qrCode }: SellerQRCodeCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResolutions, setShowResolutions] = useState(false);

  const handleDownload = useCallback(async (resolution: Resolution) => {
    try {
      setIsDownloading(true);
      
      // Se for resolução original, faz download direto
      if (resolution.size === 0) {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${sellerName.replace(/\s+/g, '-').toLowerCase()}-original.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`QR Code baixado (Original)`);
        return;
      }

      // Para resoluções específicas, redimensiona a imagem
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const img = new window.Image();
      const url = window.URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = resolution.size;
        canvas.height = resolution.size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, resolution.size, resolution.size);
          
          canvas.toBlob((resizedBlob) => {
            if (resizedBlob) {
              const downloadUrl = window.URL.createObjectURL(resizedBlob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `qrcode-${sellerName.replace(/\s+/g, '-').toLowerCase()}-${resolution.size}px.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(downloadUrl);
              toast.success(`QR Code baixado (${resolution.label})`);
            }
          }, 'image/png');
        }
        
        window.URL.revokeObjectURL(url);
      };
      
      img.onerror = () => {
        window.URL.revokeObjectURL(url);
        toast.error('Erro ao processar a imagem');
      };
      
      img.src = url;
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      toast.error('Erro ao baixar QR Code');
    } finally {
      setIsDownloading(false);
      setShowResolutions(false);
    }
  }, [qrCodeUrl, sellerName]);

  const copyQRCodeLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/qr/${qrCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  }, [qrCode]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Meu QR Code</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            ID: {qrCode}
          </span>
        </div>
      </div>

      {/* QR Code Image */}
      <div className="mb-4 flex justify-center">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="relative w-48 h-48">
            <Image
              src={qrCodeUrl}
              alt={`QR Code de ${sellerName}`}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-600">
          Compartilhe este QR Code com seus clientes para que eles possam acessar seu link de cadastro.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Download Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowResolutions(!showResolutions)}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{isDownloading ? 'Baixando...' : 'Baixar QR Code'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showResolutions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Resolution Dropdown */}
          {showResolutions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {resolutions.map((resolution) => (
                <button
                  key={resolution.label}
                  onClick={() => handleDownload(resolution)}
                  disabled={isDownloading}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg disabled:opacity-50"
                >
                  {resolution.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy Link Button */}
        <button
          onClick={copyQRCodeLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Copiar Link</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Dica:</strong> Você pode baixar o QR Code em diferentes resoluções para usar em materiais impressos ou digitais.
        </p>
      </div>
    </div>
  );
}
