 'use client';

import { useEffect, useCallback, memo, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Lead, WhatsappTemplate } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Icon } from '../ui/Icon';
import toast from 'react-hot-toast';
import ResponsiveModal from '@/components/ResponsiveModal';
import {
  getActiveTemplates,
  processMessage,
  generateWhatsappLink,
} from '@/lib/services/whatsapp-template.service';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  className?: string;
}

function LeadDetailsModal({ isOpen, onClose, lead, className }: LeadDetailsModalProps) {
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
      // Carregar templates de WhatsApp
      loadWhatsappTemplates();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const loadWhatsappTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const templates = await getActiveTemplates();
      setWhatsappTemplates(templates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  const isImageUrl = (url?: string) => {
    if (!url) return false;
    const maybe = ensureDataUrl(url);
    if (maybe && /^data:image\//.test(maybe)) return true;
    // Also check for HTTP URLs that are likely images
    if (maybe && /^https?:\/\//.test(maybe)) {
      const lower = maybe.toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/.test(lower);
    }
    return false;
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
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsappTemplate[]>([]);
  const [showWhatsappTemplateSelector, setShowWhatsappTemplateSelector] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const isMobile = useIsMobile();
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
      setTimeout(() => toast.success('Copiado para a área de transferência!'), 200);
    } catch (err) {
      console.error('Erro ao copiar', err);
    }
  };

  const handleSendWhatsapp = async (template: WhatsappTemplate) => {
    try {
      const processed = await processMessage(template.id, lead.name);
      if (processed) {
        const whatsappLink = generateWhatsappLink(lead.phone, processed.message);
        window.open(whatsappLink, '_blank');
        toast.success('Abrindo conversa do WhatsApp...');
        setShowWhatsappTemplateSelector(false);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      toast.error('Erro ao processar mensagem');
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div onClick={(e) => {
      e.stopPropagation()
    }}
    >
      {/* Header */}
      <div className="flex items-center justify-between md:mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Detalhes do Lead</h2>
          <p className="text-sm text-gray-500">Informações detalhadas e anexos</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline-blue" onClick={downloadAll} className="hidden sm:inline-flex">
            <Icon icon="bi-download" className="md:mr-2" /> 
            <p className="hidden md:block">Baixar tudo</p>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Informações Pessoais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Nome</p>
              <p className="text-sm font-semibold text-gray-900">{lead.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-800 truncate">{lead.email || '-'}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(lead.email)}><Icon icon="bi-clipboard" /></Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Telefone</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-800">{lead.phone || '-'}</p>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(lead.phone)}><Icon icon="bi-clipboard" /></Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowWhatsappTemplateSelector(true)}
                  title="Enviar via WhatsApp"
                  className="text-green-600 hover:text-green-700"
                >
                  <Icon icon="bi-whatsapp" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Vendedor</p>
              <p className="text-sm font-medium text-gray-900">{lead.owner?.name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Anexos</h3>

          <div className="space-y-3">
            <div>
              {(!energyUrl && !roofUrl) && (
                <p className="text-sm text-gray-500">Nenhuma imagem ou documento anexado</p>
              )}

              <div className="mt-2">
                {/* Main preview */}
                {selectedImage ? (
                  <div className="border rounded p-2 flex items-center justify-center bg-white">
                    <img
                      src={ensureDataUrl(selectedImage) || undefined}
                      alt="Preview"
                      className="max-h-96 object-contain cursor-pointer"
                      onClick={() => setLightboxOpen(true)}
                    />
                  </div>
                ) : (
                  (roofUrl || energyUrl) && (
                    <div className="border rounded p-2 flex items-center justify-center bg-white">
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
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roofUrl && (
                  <div>
                    Foto do telhado
                    <div className={`border rounded overflow-hidden cursor-pointer relative ${selectedImage === roofUrl ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedImage(roofUrl || null)}>
                      {isImageUrl(roofUrl) ? (
                        <img src={ensureDataUrl(roofUrl) || undefined} alt="telhado" className="w-full h-28 object-cover bg-white" />
                      ) : (
                        <div className="w-full h-28 flex items-center justify-center bg-gray-50">Documento</div>
                      )}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 hover:opacity-100">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); downloadFile(ensureDataUrl(roofUrl!) || roofUrl!, `lead-${lead.id}-roof`); }}>Baixar</Button>
                      </div>
                    </div>
                  </div>
                )}

                {energyUrl && (
                  <div>
                    Conta de energia
                    <div className={`border rounded overflow-hidden cursor-pointer relative ${selectedImage === energyUrl ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelectedImage(energyUrl || null)}>
                      {isImageUrl(energyUrl) ? (
                        <img src={ensureDataUrl(energyUrl) || undefined} alt="conta" className="w-full h-28 object-cover bg-white" />
                      ) : (
                        <div className="w-full h-28 flex items-center justify-center bg-gray-50">Documento</div>
                      )}
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 hover:opacity-100">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); downloadFile(ensureDataUrl(energyUrl!) || energyUrl!, `lead-${lead.id}-energybill`); }}>Baixar</Button>
                      </div>
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
      <div className="mt-6 flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={onClose} variant="outline-danger">
          Fechar
        </Button>
      </div>

      {/* Padding para mobile */}
      <div className="h-4 sm:h-0" />

      {lightboxOpen && selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button className="absolute top-3 right-3 z-10 rounded p-2 bg-white/90" onClick={() => setLightboxOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <img src={ensureDataUrl(selectedImage) || undefined} alt="Lightbox" className="w-full max-h-[80vh] object-contain rounded"/>
          </div>
        </div>
      )}

      {/* WhatsApp Template Selector Modal */}
      {showWhatsappTemplateSelector && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowWhatsappTemplateSelector(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  <Icon icon="bi-whatsapp" className="inline mr-2 text-green-600" />
                  Enviar via WhatsApp
                </h2>
                <p className="text-sm text-gray-500 mt-1">Selecione um template de mensagem</p>
              </div>
            </div>

            {/* Content */}
            <div className="md:p-2">
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-600">Carregando templates...</p>
                </div>
              ) : whatsappTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Icon icon="bi-info-circle" className="text-gray-400 text-3xl mx-auto mb-2" />
                  <p className="text-gray-600">Nenhum template disponível</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {whatsappTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-2 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition cursor-pointer group"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {template.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-3 whitespace-wrap">
                            {template.message.replace(/{{NOME_CLIENTE}}/g, lead.name)}
                          </p>
                        </div>
                        <Button
                          size={isMobile ? 'md' : 'sm'}
                          variant="gradient"
                          onClick={() => handleSendWhatsapp(template)}
                          className="whitespace-nowrap shrink-0"
                        >
                          <Icon icon="bi-send" className="md:mr-1" />
                          <p className="hidden md:block">Enviar</p>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline-danger"
                onClick={() => setShowWhatsappTemplateSelector(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} className={className}>
      <div className="p-4 md:p-6">
        {modalContent}
      </div>
    </ResponsiveModal>
  );
}

export default memo(LeadDetailsModal);
