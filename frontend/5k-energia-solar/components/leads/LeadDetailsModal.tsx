'use client';

import { useEffect, useCallback, memo, useState } from 'react';
import { Lead } from '@/lib/types';
import Button from '@/components/ui/Button';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  const isImageUrl = (url?: string) => {
    if (!url) return false;
    return /(^data:image\/)|\.(png|jpe?g|webp|gif|bmp)(\?|$)/i.test(url);
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      // If it's a data URL, just use anchor
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch (err) {
      console.error('Erro ao baixar arquivo', err);
      // fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  // UX improvements
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const downloadAll = async () => {
    const files: Array<{ url: string; name: string }> = [];
    if (lead.energyBillUrl) files.push({ url: lead.energyBillUrl, name: `lead-${lead.id}-energybill` });
    if (lead.roofPhotoUrl) files.push({ url: lead.roofPhotoUrl, name: `lead-${lead.id}-roof` });
    for (const f of files) {
      // eslint-disable-next-line no-await-in-loop
      await downloadFile(f.url, f.name);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 120));
    }
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setTimeout(() => alert('Copiado para a área de transferência'), 50);
    } catch (err) {
      console.error('Erro ao copiar', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes do Lead</h2>
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

        {/* Content */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Informações Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Nome</label>
                <p className="text-sm font-medium text-gray-900">{lead.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Email</label>
                <p className="text-sm font-medium text-gray-900">{lead.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Telefone</label>
                <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Vendedor</label>
                <p className="text-sm font-medium text-gray-900">{lead.owner?.name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Anexos</h3>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{lead.email || '-'}</p>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(lead.email)}>Copiar</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Telefone</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{lead.phone || '-'}</p>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(lead.phone)}>Copiar</Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={downloadAll}>Baixar tudo</Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                {(!lead.energyBillUrl && !lead.roofPhotoUrl) && (
                  <p className="text-sm text-gray-500">Nenhuma imagem ou documento anexado</p>
                )}

                <div className="mt-2">
                  {/* Main preview */}
                  {selectedImage ? (
                    <div className="border rounded p-2 flex items-center justify-center">
                      <img
                        src={selectedImage}
                        alt="Preview"
                        className="max-h-96 object-contain cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                      />
                    </div>
                  ) : (
                    (lead.roofPhotoUrl || lead.energyBillUrl) && (
                      <div className="border rounded p-2 flex items-center justify-center">
                        <img
                          src={lead.roofPhotoUrl || lead.energyBillUrl}
                          alt="Preview"
                          className="max-h-96 object-contain cursor-pointer"
                          onClick={() => { setSelectedImage(lead.roofPhotoUrl || lead.energyBillUrl || null); setLightboxOpen(true); }}
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Thumbnails */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {lead.roofPhotoUrl && (
                    <div className={`border rounded overflow-hidden cursor-pointer ${selectedImage === lead.roofPhotoUrl ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedImage(lead.roofPhotoUrl || null)}>
                      <img src={lead.roofPhotoUrl} alt="telhado" className="w-full h-28 object-cover bg-white" />
                      <div className="p-1 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => openFile(lead.roofPhotoUrl!)}>Abrir</Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadFile(lead.roofPhotoUrl!, `lead-${lead.id}-roof`)}>Baixar</Button>
                      </div>
                    </div>
                  )}

                  {lead.energyBillUrl && (
                    <div className={`border rounded overflow-hidden cursor-pointer ${selectedImage === lead.energyBillUrl ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedImage(lead.energyBillUrl || null)}>
                      {isImageUrl(lead.energyBillUrl) ? (
                        <img src={lead.energyBillUrl} alt="conta" className="w-full h-28 object-cover bg-white" />
                      ) : (
                        <div className="w-full h-28 flex items-center justify-center bg-gray-50">Documento</div>
                      )}
                      <div className="p-1 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => openFile(lead.energyBillUrl!)}>Abrir</Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadFile(lead.energyBillUrl!, `lead-${lead.id}-energybill`)}>Baixar</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Date */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Status</label>
                <p className="text-sm font-medium text-gray-900">
                  {lead.status === 'BOUGHT' && 'Comprou'}
                  {lead.status === 'NEGOTIATION' && 'Negociando'}
                  {lead.status === 'CANCELLED' && 'Cancelado'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Data de Cadastro</label>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(LeadDetailsModal);
