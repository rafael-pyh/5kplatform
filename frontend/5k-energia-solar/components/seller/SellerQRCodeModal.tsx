'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface SellerQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function SellerQRCodeModal({
  isOpen,
  onClose,
  qrCodeUrl,
  sellerName,
  qrCode,
}: SellerQRCodeModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showResolutions, setShowResolutions] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const handleDownload = useCallback(
    async (resolution: Resolution) => {
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
    },
    [qrCodeUrl, sellerName]
  );

  const copyQRCodeLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/qr/${qrCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  }, [qrCode]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Meu QR Code</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {qrCode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* QR Code Image */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <div className="relative w-64 h-64">
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
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">
            Compartilhe este QR Code com seus clientes para que eles possam acessar seu link de
            cadastro.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Download Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowResolutions(!showResolutions)}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Resolution Dropdown */}
            {showResolutions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {resolutions.map((resolution, index) => (
                  <button
                    key={resolution.label}
                    onClick={() => handleDownload(resolution)}
                    disabled={isDownloading}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${index === resolutions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{resolution.label}</span>
                      {resolution.size === 0 && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Recomendado
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Copy Link Button */}
          <button
            onClick={copyQRCodeLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            Fechar
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <strong>Dica:</strong> Escolha a resolução adequada para impressão ou compartilhamento
            digital.
          </p>
        </div>
      </div>
    </div>
  );
}
