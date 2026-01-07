 'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { composePosterBlob } from '../lib/composePoster';
import PosterPreview from './PosterPreview';
import useModalEscape from '@/hooks/useModalEscape';
import usePosterPreview from '@/hooks/usePosterPreview';
import useImagePanZoom from '@/hooks/useImagePanZoom';
import useQRCodeWithVendor from '@/hooks/useQRCodeWithVendor';
import ModalHeader from '@/components/ModalHeader';
import ActionButtons from '@/components/ActionButtons';
import { Button } from './ui';
import { Icon } from '@/components/ui/Icon';
import { isValidQRCode } from '@/lib/utils/imageUrl';
import ResponsiveModal from '@/components/ResponsiveModal';

interface Creative {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  type: string;
  tags?: string;
  downloadCount: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeBase64: string; // Base64 data URL
  personName: string;
  qrCode?: string;
  userRole?: 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
}

export default function QRCodeModal({ isOpen, onClose, qrCodeBase64, personName, qrCode, userRole = 'SELLER' }: QRCodeModalProps) {
  const [resolution, setResolution] = useState<number | 'original'>(512);
  const [previewMode, setPreviewMode] = useState<'qr' | 'criativos' | 'poster'>('qr');
  const [customPoster, setCustomPoster] = useState<string | null>(null);
  const [criativos, setCriativos] = useState<Creative[]>([]);
  const [loadingCriativos, setLoadingCriativos] = useState(false);
  const [selectedCriativoId, setSelectedCriativoId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const emptyOverlayRef = useRef<HTMLDivElement | null>(null);
  const [overlayCenter, setOverlayCenter] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.4 });
  const [overlaySizePercent, setOverlaySizePercent] = useState<number>(22);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Generate QR code with vendor name embedded
  const { qrCodeWithVendor } = useQRCodeWithVendor(qrCodeBase64, personName);
  
  // manage escape key and body overflow
  useModalEscape(isOpen, onClose);

  // Carregar criativos ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchCriativos = async () => {
      try {
        setLoadingCriativos(true);
        const response = await api.get<any>('/creatives?limit=50');
        const criativos = response.data.data.criativos || [];
        setCriativos(criativos);
      } catch (error) {
        console.error('[QRCodeModal] Erro ao carregar criativos:', error);
        toast.error('Erro ao carregar criativos');
      } finally {
        setLoadingCriativos(false);
      }
    };
    
    fetchCriativos();
  }, [isOpen]);

  // Carregar posição do QR code salva pelo admin
  const loadQRPosition = async (criativoId: string) => {
    try {
      const response = await api.get<any>(`/creatives/${criativoId}/qr-position`);
      const position = response.data.data;
      
      // Se houver posição salva, carregar
      if (position.boxCenterXRatio !== undefined && position.boxCenterYRatio !== undefined && position.boxSizeRatio !== undefined) {
        setOverlayCenter({ x: position.boxCenterXRatio, y: position.boxCenterYRatio });
        setOverlaySizePercent(position.boxSizeRatio * 100);
        return true;
      }
      
      // Sem posição salva, usar padrão
      setOverlayCenter({ x: 0.7, y: 0.7 });
      setOverlaySizePercent(15);
      return false;
    } catch (error) {
      console.error('Erro ao carregar posição do QR code:', error);
      // Se erro, usar posição padrão
      setOverlayCenter({ x: 0.7, y: 0.7 });
      setOverlaySizePercent(15);
    }
  };

  // Handler para selecionar um criativo
  const handleSelectCriativo = async (criativo: Creative) => {
    setCustomPoster(criativo.imageUrl);
    setSelectedCriativoId(criativo.id);
    setPreviewMode('poster');
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
    
    // Carregar posição salva do criativo
    await loadQRPosition(criativo.id);
  };


  // poster preview generator hook (handles auto composition when not using customPoster)
  const posterPreviewHook = usePosterPreview({
    previewMode,
    qrCodeBase64: qrCodeWithVendor,
    customPoster,
    boxCenterXRatio: overlayCenter.x,
    boxCenterYRatio: overlayCenter.y,
    boxSizeRatio: overlaySizePercent / 100,
    vendorName: personName,
  });
  const posterPreviewValue = posterPreviewHook.posterPreview;



  // image panning
  const { start: startImageDrag, imageDragRef } = useImagePanZoom((dx: number, dy: number) => {
    if (!imageDragRef.current) return;
    setPanPos({ x: imageDragRef.current.startPanX + dx, y: imageDragRef.current.startPanY + dy });
  });



  // Handlers
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
      img.src = qrCodeWithVendor;
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
    }
  };

  const handleDownloadPoster = async () => {
    try {
      // Use the admin-defined position for the poster
      const blob = await composePosterBlob(qrCodeWithVendor, {
        outputWidth: 2048,
        posterUrl: customPoster || undefined,
        boxCenterXRatio: overlayCenter.x,
        boxCenterYRatio: overlayCenter.y,
        boxSizeRatio: overlaySizePercent / 100,
        vendorName: personName,
      });
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

  const handleSaveAndDownload = async () => {
    try {
      if (!customPoster) {
        toast.error('Selecione um criativo antes de salvar.');
        return;
      }

      // Use the admin-defined position
      const blob = await composePosterBlob(qrCodeWithVendor, {
        outputWidth: 2048,
        posterUrl: customPoster,
        boxCenterXRatio: overlayCenter.x,
        boxCenterYRatio: overlayCenter.y,
        boxSizeRatio: overlaySizePercent / 100,
        vendorName: personName,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `placa-${personName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Placa salva e baixada com sucesso');
    } catch (err) {
      console.error('Erro ao salvar placa:', err);
      toast.error('Erro ao salvar placa');
    }
  };

  // Share QR Code or Poster using Web Share API when possible
  const [sharing, setSharing] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copiado para a área de transferência');
    } catch (err) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  const base64ToFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const getQRShareUrl = () => {
    return `${window.location.origin}/lead/new?qr=${qrCode}`;
  };

  const shareQRCode = async () => {
    try {
      setSharing(true);
      

      if (!qrCode) {
        toast.error('QR Code não disponível para compartilhamento');
        setSharing(false);
        return;
      }
      
      const nav: any = navigator;
      const shareUrl = getQRShareUrl();

      // try to share as file if supported
      if (nav.canShare) {
        try {
          const file = base64ToFile(qrCodeWithVendor, `qrcode-${personName.replace(/\s+/g, '-')}.png`);
          if (nav.canShare({ files: [file] })) {
            await nav.share({ files: [file], title: `QR Code - ${personName}`, text: `QR Code de ${personName}` });
            setSharing(false);
            return;
          }
        } catch (err) {
          // fallthrough to share link
        }
      }

      if (nav.share) {
        await nav.share({ title: `QR Code - ${personName}`, text: `Acesse: ${shareUrl}`, url: shareUrl });
        setSharing(false);
        return;
      }

      // fallback: copy link
      await copyToClipboard(shareUrl);
    } catch (err) {
      console.error('Erro ao compartilhar QR Code', err);
      toast.error('Erro ao compartilhar QR Code');
    } finally {
      setSharing(false);
    }
  };

  const shareViaWhatsApp = async () => {
    try {
      setSharing(true);
      
      if (!qrCode) {
        toast.error('QR Code não disponível para compartilhamento');
        setSharing(false);
        return;
      }
      
      const shareUrl = `${window.location.origin}/lead/new?qr=${encodeURIComponent(qrCode)}`;
      const text = `Confira o QR Code de ${personName}: ${shareUrl}`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('Erro ao compartilhar via WhatsApp', err);
      toast.error('Erro ao compartilhar via WhatsApp');
    } finally {
      setSharing(false);
    }
  };

  const sharePoster = async () => {
    try {
      setSharing(true);
      const nav: any = navigator;
      const options: any = {
        outputWidth: 2048,
      };
      if (customPoster) {
        options.posterUrl = customPoster;
        options.boxCenterXRatio = overlayCenter.x;
        options.boxCenterYRatio = overlayCenter.y;
        options.boxSizeRatio = overlaySizePercent / 100;
        options.vendorName = personName;
      }

      const blob = await composePosterBlob(qrCodeWithVendor, options as any);
      const file = new File([blob], `placa-${personName.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: `Placa - ${personName}`, text: `Placa com QR Code de ${personName}` });
        setSharing(false);
        return;
      }

      // fallback: trigger download and copy a message with instructions
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `placa-${personName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Placa baixada. Compartilhe manualmente se desejar.');
    } catch (err) {
      console.error('Erro ao compartilhar placa', err);
      toast.error('Erro ao compartilhar placa');
    } finally {
      setSharing(false);
    }
  };

  const handleImagePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (zoomLevel <= 1) return;
    startImageDrag(e.clientX, e.clientY, panPos.x, panPos.y);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  if (!isOpen) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        <ModalHeader personName={personName} onClose={onClose} />

        {/* Tabs to switch between modes */}
        <div className="mb-4 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setPreviewMode('qr')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              previewMode === 'qr'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setPreviewMode('criativos')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              previewMode === 'criativos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Criativos
          </button>
          {customPoster && (
            <button
              onClick={() => setPreviewMode('poster')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                previewMode === 'poster'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Placa com QR
            </button>
          )}
        </div>

        <div className="mb-4 flex justify-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 w-full">
            {/* Creative Gallery - Available for all users in criativos mode */}
            {previewMode === 'criativos' && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Selecione um Criativo</h3>
                {loadingCriativos ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : criativos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <p>📭 Nenhum criativo disponível no momento</p>
                  </div>
                ) : (
                  <div className="flex md:grid md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                    {criativos.map((criativo) => (
                      <div
                        key={criativo.id}
                        onClick={() => handleSelectCriativo(criativo)}
                        className={`relative p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          selectedCriativoId === criativo.id
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-300'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="relative w-full h-28 mb-2 rounded overflow-hidden bg-gray-100">
                          <img
                            src={criativo.imageUrl}
                            alt={criativo.name}
                            className="w-full h-full object-cover"
                          />
                          {selectedCriativoId === criativo.id && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                              <div className="text-3xl">✓</div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-700 truncate">{criativo.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <span>👤 {criativo.uploadedBy?.name || 'Admin'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <PosterPreview
              previewMode={previewMode}
              previewRef={previewRef}
              overlayRef={emptyOverlayRef}
              customPoster={customPoster}
              posterPreview={posterPreviewValue}
              overlayCenter={overlayCenter}
              overlaySizePercent={overlaySizePercent}
              qrCodeBase64={qrCodeWithVendor}
              showQROverlay={true}
              onOverlayPointerDown={() => {}}
              handleImagePointerDown={handleImagePointerDown}
              panPos={panPos}
              zoomLevel={zoomLevel}
              personName={personName}
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          {previewMode === 'qr' && (
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Resolução</label>
              <select value={resolution === 'original' ? 'original' : String(resolution)} onChange={(e) => { const v = e.target.value; setResolution(v === 'original' ? 'original' : Number(v)); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white cursor-pointer">
                <option value="256">256</option>
                <option value="512">512</option>
                <option value="1024">1024</option>
                <option value="original">Original</option>
              </select>
            </div>
          )}
          <ActionButtons onDownloadQR={handleDownload} onDownloadPoster={handleDownloadPoster} onSaveAndDownload={handleSaveAndDownload} previewMode={previewMode} />

          {/* Share buttons visible in QR and Poster modes */}
          {previewMode === 'qr' && (
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={shareViaWhatsApp} variant="outline-green" className="px-3 py-2 flex items-center gap-2 justify-center text-sm">
                <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                <span>WhatsApp</span>
              </Button>
              <Button onClick={shareQRCode} variant="outline-blue" className="px-3 py-2 flex items-center gap-2 justify-center text-sm">
                <Icon icon="bi-share" className="w-4 h-4" />
                <span>Compartilhar</span>
              </Button>
              <Button onClick={() => copyToClipboard(getQRShareUrl())} variant="outline" className="px-3 py-2 flex items-center gap-2 justify-center text-sm">
                <Icon icon="bi-link-45deg" className="w-4 h-4" />
                <span>Copiar Link</span>
              </Button>
            </div>
          )}

          {previewMode === 'poster' && (
            <div className="flex items-center gap-2">
              <Button onClick={shareViaWhatsApp} variant="outline-green" className="w-1/2 px-3 py-2 flex items-center gap-2">
                <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                <span>WhatsApp</span>
              </Button>
              <Button onClick={sharePoster} variant="outline-blue" className="w-1/2 px-3 py-2 flex items-center gap-2">
                <Icon icon="bi-clipboard" className="w-4 h-4" />
                <span>Compartilhar Placa</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
}
