'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { composePosterBlob, composePosterDataUrl } from '../lib/composePoster';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeBase64: string; // Base64 data URL
  personName: string;
}

export default function QRCodeModal({ isOpen, onClose, qrCodeBase64, personName }: QRCodeModalProps) {
  const [resolution, setResolution] = useState<number | 'original'>(512);
  const [previewMode, setPreviewMode] = useState<'qr' | 'poster'>('qr');
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        const targetSize = resolution === 'original' ? Math.max(img.width, img.height) : (resolution as number);
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Cannot get canvas context');
        // Fill white background to avoid transparent pixels
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw the QR centered and scaled to fit
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return console.error('Failed to create blob from canvas');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qrcode-${personName.replace(/\s+/g, '-').toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      img.onerror = (err: Event | string | any) => {
        console.error('Erro ao carregar imagem do QR Code', err);
      };
      img.src = qrCodeBase64;
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
    }
  };

  const handleDownloadPoster = async () => {
    try {
      const blob = await composePosterBlob(qrCodeBase64, { outputWidth: 2048 });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `placa-${personName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar placa com QR:', error);
    }
  };

  // poster composition moved to shared helper `composePosterDataUrl` in lib/composePoster

  useEffect(() => {
    let mounted = true;
    if (previewMode === 'poster') {
      composePosterDataUrl(qrCodeBase64, { outputWidth: 900, boxCenterXRatio: 0.5, boxCenterYRatio: 0.40, boxSizeRatio: 0.22 })
        .then((dataUrl) => {
          if (mounted) setPosterPreview(dataUrl);
        })
        .catch((err) => {
          console.error('Erro ao compor preview da placa:', err);
          if (mounted) setPosterPreview(null);
        });
    } else {
      if (mounted) setPosterPreview(null);
    }

    return () => {
      mounted = false;
    };
  }, [previewMode, qrCodeBase64]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview selector */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPreviewMode('qr')}
            className={`px-3 py-2 rounded-lg ${previewMode === 'qr' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Visualizar QR
          </button>
          <button
            onClick={() => setPreviewMode('poster')}
            className={`px-3 py-2 rounded-lg ${previewMode === 'poster' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Visualizar Placa
          </button>
        </div>

        {/* Preview Area */}
        <div className="mb-4 flex justify-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {previewMode === 'qr' && (
                <div className="relative w-64 h-64">
                  <Image
                    src={qrCodeBase64}
                    alt={`QR Code de ${personName}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}

              {previewMode === 'poster' && (
                posterPreview ? (
                  // show poster preview (scaled)
                  <img src={posterPreview} alt="Preview da placa" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-sm text-gray-500">Gerando preview...</div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Person Name */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600">Vendedor</p>
          <p className="text-lg font-medium text-gray-900">{personName}</p>
        </div>

        {/* Actions */}
        <div className='flex flex-col gap-2'>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Resolução</label>
            <select
              value={resolution === 'original' ? 'original' : String(resolution)}
              onChange={(e) => {
                const v = e.target.value;
                setResolution(v === 'original' ? 'original' : Number(v));
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white cursor-pointer"
            >
              <option value="256">256</option>
              <option value="512">512</option>
              <option value="1024">1024</option>
              <option value="original">Original</option>
            </select>
          </div>
          <div className="mb-4 flex items-center gap-3">

            <div className="flex-1 flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Baixar QR Code
              </button>
              <button
                onClick={handleDownloadPoster}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4" />
                </svg>
                Baixar placa
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
