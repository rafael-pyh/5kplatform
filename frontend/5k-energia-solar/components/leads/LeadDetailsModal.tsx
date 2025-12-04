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
    const maybe = ensureDataUrl(url);
    return !!maybe && /^data:image\//.test(maybe);
  };

  function ensureDataUrl(value?: string | null): string | null {
    if (!value) return null;
    const v = value.trim();
    if (v.startsWith('data:')) return v;
    if (/^https?:\/\//i.test(v)) return v;

    // Heuristic: raw base64 without data: prefix
    // Check first few chars to guess MIME
    const head = v.substring(0, 4);
    const b64 = v.replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/=]+$/.test(b64)) return v; // not pure base64, return as-is

    // JPEG base64 often starts with /9j or /9 (after decoding), raw base64 may start with '/9j' or similar
    if (head === '/9j' || head === '/9J' || b64.startsWith('/9j')) return `data:image/jpeg;base64,${b64}`;
    if (b64.startsWith('iVBOR')) return `data:image/png;base64,${b64}`;
    if (b64.startsWith('R0lG')) return `data:image/gif;base64,${b64}`;
    if (b64.startsWith('JVBE') || b64.startsWith('%PDF')) return `data:application/pdf;base64,${b64}`;

    // Default to jpeg if looks like base64
    return `data:image/jpeg;base64,${b64}`;
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      // Normalize potential raw base64 / relative strings to data: or http(s):
      const target = ensureDataUrl(url) || url;

      // If it's a data URL, just use anchor
      if (target.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = target;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const res = await fetch(target);
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
  // normalize different field names returned by backend
  const rawEnergy: string | null = (lead as any).energyBillUrl || (lead as any).energyBill || null;
  const rawRoof: string | null = (lead as any).roofPhotoUrl || (lead as any).roofPhoto || null;
  const energyUrl: string | null = ensureDataUrl(rawEnergy) || null;
  const roofUrl: string | null = ensureDataUrl(rawRoof) || null;

  const downloadAll = async () => {
    const files: Array<{ url: string; name: string }> = [];
    if (energyUrl) files.push({ url: energyUrl, name: `lead-${lead.id}-energybill` });
    if (roofUrl) files.push({ url: roofUrl, name: `lead-${lead.id}-roof` });
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn"
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
                {(!energyUrl && !roofUrl) && (
                  <p className="text-sm text-gray-500">Nenhuma imagem ou documento anexado</p>
                )}

                <div className="mt-2">
                  {/* Main preview */}
                  {selectedImage ? (
                    <div className="border rounded p-2 flex items-center justify-center">
                      <img
                        src={ensureDataUrl(selectedImage) || undefined}
                        alt="Preview"
                        className="max-h-96 object-contain cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                      />
                    </div>
                  ) : (
                    (roofUrl || energyUrl) && (
                      <div className="border rounded p-2 flex items-center justify-center">
                        <img
                          src={ensureDataUrl(roofUrl || energyUrl) || undefined}
                          alt="Preview"
                          className="max-h-96 object-contain cursor-pointer"
                          onClick={() => { setSelectedImage(roofUrl || energyUrl || null); setLightboxOpen(true); }}
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Thumbnails */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {roofUrl && (
                    <div className={`border rounded overflow-hidden cursor-pointer ${selectedImage === roofUrl ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedImage(roofUrl || null)}>
                      {isImageUrl(roofUrl) ? (
                        <img src={ensureDataUrl(roofUrl) || undefined} alt="telhado" className="w-full h-28 object-cover bg-white" />
                      ) : (
                        <div className="w-full h-28 flex items-center justify-center bg-gray-50">Documento</div>
                      )}
                      <div className="p-1 flex w-full justify-end">
                        <Button variant="ghost" size="sm" onClick={() => downloadFile(ensureDataUrl(roofUrl!) || roofUrl!, `lead-${lead.id}-roof`)}>Baixar</Button>
                      </div>
                    </div>
                  )}

                  {energyUrl && (
                    <div className={`border rounded overflow-hidden cursor-pointer ${selectedImage === energyUrl ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedImage(energyUrl || null)}>
                      {isImageUrl(energyUrl) ? (
                        <img src={ensureDataUrl(energyUrl) || undefined} alt="conta" className="w-full h-28 object-cover bg-white" />
                      ) : (
                        <div className="w-full h-28 flex items-center justify-center bg-gray-50">Documento</div>
                      )}
                      <div className="p-1 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => openFile(ensureDataUrl(energyUrl!) || energyUrl!)}>Abrir</Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadFile(ensureDataUrl(energyUrl!) || energyUrl!, `lead-${lead.id}-energybill`)}>Baixar</Button>
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
