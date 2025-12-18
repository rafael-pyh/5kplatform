 'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { composePosterBlob } from '../lib/composePoster';
import SliderControl from './SliderControl';
import PosterPreview from './PosterPreview';
import useModalEscape from '@/hooks/useModalEscape';
import usePosterPreview from '@/hooks/usePosterPreview';
import useOverlayDrag from '@/hooks/useOverlayDrag';
import useImagePanZoom from '@/hooks/useImagePanZoom';
import useQRCodeWithVendor from '@/hooks/useQRCodeWithVendor';
import ModalHeader from '@/components/ModalHeader';
import ActionButtons from '@/components/ActionButtons';
import { Button } from './ui';
import { Icon } from '@/components/ui/Icon';

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
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlaySize, setOverlaySize] = useState<number>(140); // px in preview
  const [overlayCenter, setOverlayCenter] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.4 }); // relative (0-1)
  const [overlaySizePercent, setOverlaySizePercent] = useState<number>(22); // percent of preview width
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showQROverlay, setShowQROverlay] = useState<boolean>(false);
  const disableDragRef = useRef<boolean>(false);
  
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
        setCriativos(response.data.data.criativos || []);
      } catch (error) {
        console.error('Erro ao carregar criativos:', error);
        toast.error('Erro ao carregar criativos');
      } finally {
        setLoadingCriativos(false);
      }
    };
    
    fetchCriativos();
  }, [isOpen]);

  // Handler para selecionar um criativo
  const handleSelectCriativo = (criativo: Creative) => {
    setCustomPoster(criativo.imageUrl);
    setSelectedCriativoId(criativo.id);
    setPreviewMode('poster');
    // Resetar posicionamento do QR code
    setOverlayCenter({ x: 0.7, y: 0.7 });
    setOverlaySizePercent(15);
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
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

  // overlay dragging
  const { start: startOverlayDrag, draggingRef: overlayDraggingRef } = useOverlayDrag((clientX: number, clientY: number) => {
    if (!overlayDraggingRef.current || !overlayDraggingRef.current.dragging || !previewRef.current) return;
    const previewRect = previewRef.current.getBoundingClientRect();
    const x = clientX - previewRect.left - (overlayDraggingRef.current.offsetX || 0);
    const y = clientY - previewRect.top - (overlayDraggingRef.current.offsetY || 0);
    const maxX = previewRect.width - overlaySize;
    const maxY = previewRect.height - overlaySize;
    setOverlayPos({ x: Math.max(0, Math.min(x, maxX)), y: Math.max(0, Math.min(y, maxY)) });
  }, () => {
    // onEnd: sync center ratios
    if (previewRef.current && overlayRef.current) {
      const previewRect = previewRef.current.getBoundingClientRect();
      const overlayRect = overlayRef.current.getBoundingClientRect();
      const centerX = (overlayRect.left + overlayRect.width / 2 - previewRect.left) / previewRect.width;
      const centerY = (overlayRect.top + overlayRect.height / 2 - previewRect.top) / previewRect.height;
      setOverlayCenter({ x: Math.max(0, Math.min(1, centerX)), y: Math.max(0, Math.min(1, centerY)) });
    }
  });

  // image panning
  const { start: startImageDrag, imageDragRef } = useImagePanZoom((dx: number, dy: number) => {
    if (!imageDragRef.current) return;
    setPanPos({ x: imageDragRef.current.startPanX + dx, y: imageDragRef.current.startPanY + dy });
  });

  // When entering poster preview or when preview size/state changes, initialize overlay position/size
  useEffect(() => {
    if (previewMode !== 'poster') return;
    const init = () => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const sizePx = Math.round(rect.width * (overlaySizePercent / 100));
      setOverlaySize(sizePx);
      const left = Math.round(rect.width * overlayCenter.x - sizePx / 2);
      const top = Math.round(rect.height * overlayCenter.y - sizePx / 2);
      setOverlayPos({ x: Math.max(0, Math.min(left, rect.width - sizePx)), y: Math.max(0, Math.min(top, rect.height - sizePx)) });
    };
    const t = setTimeout(init, 50);
    return () => clearTimeout(t);
  }, [previewMode, posterPreviewValue, customPoster, overlayCenter.x, overlayCenter.y, overlaySizePercent]);

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
      // if user provided a custom poster, compute ratios from overlay position
      if (customPoster && previewRef.current && overlayRef.current) {
        const overlayRect = overlayRef.current.getBoundingClientRect();
        // find poster image element in preview
        const imgEl = previewRef.current.querySelector('img[alt="Poster custom"]') as HTMLImageElement | null;
        const firstImg = previewRef.current.querySelector('img:not([alt="QR overlay"])') as HTMLImageElement | null;
        const posterImg = imgEl || firstImg;
        if (!posterImg) {
          throw new Error('Imagem da placa não encontrada');
        }

        // Compute the mapping
        const natW = posterImg.naturalWidth || posterImg.width;
        const natH = posterImg.naturalHeight || posterImg.height;
        const previewRect = previewRef.current.getBoundingClientRect();

        // base fit scale used by object-contain
        const baseScale = Math.min(previewRect.width / natW, previewRect.height / natH);
        const finalImgW = natW * baseScale;
        const finalImgH = natH * baseScale;

        // image center in page coords (object-contain centers the image in the container)
        const imgCenterX = previewRect.left + previewRect.width / 2;
        const imgCenterY = previewRect.top + previewRect.height / 2;

        const imgLeft = imgCenterX - finalImgW / 2;
        const imgTop = imgCenterY - finalImgH / 2;

        const overlayCenterX = overlayRect.left + overlayRect.width / 2;
        const overlayCenterY = overlayRect.top + overlayRect.height / 2;

        const localX = (overlayCenterX - imgLeft) / finalImgW;
        const localY = (overlayCenterY - imgTop) / finalImgH;
        const boxSizeRatio = overlayRect.width / finalImgW;

        const boxCenterXRatio = Math.max(0, Math.min(1, localX));
        const boxCenterYRatio = Math.max(0, Math.min(1, localY));

        const blob = await composePosterBlob(qrCodeWithVendor, {
          outputWidth: 2048,
          posterUrl: customPoster,
          boxCenterXRatio,
          boxCenterYRatio,
          boxSizeRatio,
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
        return;
      }

      const blob = await composePosterBlob(qrCodeWithVendor, { outputWidth: 2048 });
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
      if (!customPoster || !previewRef.current) {
        toast.error('Selecione um criativo antes de salvar.');
        return;
      }

      const previewRect = previewRef.current.getBoundingClientRect();
      const overlayRect = overlayRef.current?.getBoundingClientRect();

      if (!overlayRect) {
        toast.error('Posicione o QR Code antes de salvar.');
        return;
      }

      // Find the poster image element inside preview (exclude the QR overlay image)
      const imgEl = previewRef.current.querySelector('img[alt="Poster custom"]') as HTMLImageElement | null;
      // fallback: use first img that's not the overlay
      const firstImg = previewRef.current.querySelector('img:not([alt="QR overlay"])') as HTMLImageElement | null;
      const posterImg = imgEl || firstImg;
      if (!posterImg) {
        toast.error('Imagem da placa não encontrada para compor.');
        return;
      }

      // Use natural size and container fit to compute accurate mapping
      const natW = posterImg.naturalWidth || posterImg.width;
      const natH = posterImg.naturalHeight || posterImg.height;
      const baseScale = Math.min(previewRect.width / natW, previewRect.height / natH);
      const finalImgW = natW * baseScale;
      const finalImgH = natH * baseScale;
      const imgCenterX = previewRect.left + previewRect.width / 2;
      const imgCenterY = previewRect.top + previewRect.height / 2;
      const imgLeft = imgCenterX - finalImgW / 2;
      const imgTop = imgCenterY - finalImgH / 2;

      const overlayCenterX = overlayRect.left + overlayRect.width / 2;
      const overlayCenterY = overlayRect.top + overlayRect.height / 2;
      const localX = (overlayCenterX - imgLeft) / finalImgW;
      const localY = (overlayCenterY - imgTop) / finalImgH;
      const boxSizeRatio = overlayRect.width / finalImgW;

      const boxCenterXRatio = Math.max(0, Math.min(1, localX));
      const boxCenterYRatio = Math.max(0, Math.min(1, localY));

      const blob = await composePosterBlob(qrCodeWithVendor, {
        outputWidth: 2048,
        posterUrl: customPoster,
        boxCenterXRatio,
        boxCenterYRatio,
        boxSizeRatio,
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

  const onOverlayPointerDown = (e: React.PointerEvent) => {
    if (disableDragRef.current) return;
    if (!previewRef.current || !overlayRef.current) return;
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const offsetX = e.clientX - overlayRect.left;
    const offsetY = e.clientY - overlayRect.top;
    startOverlayDrag(e.clientX, e.clientY, offsetX, offsetY);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handleImagePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (zoomLevel <= 1) return;
    startImageDrag(e.clientX, e.clientY, panPos.x, panPos.y);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const toggleQROverlay = () => {
    if (!showQROverlay) {
      // Reset QR overlay position when adding
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      setOverlaySize(Math.round(rect.width * 0.22));
      setOverlayPos({ x: Math.round((rect.width - rect.width * 0.22) / 2), y: Math.round((rect.height - rect.width * 0.22) / 2) });
    }
    setShowQROverlay(!showQROverlay);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-h-full shadow-xl max-w-xl w-full p-6 overflow-auto" onClick={(e) => e.stopPropagation()}>
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
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
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
              overlayRef={overlayRef}
              customPoster={customPoster}
              posterPreview={posterPreviewValue}
              overlayPos={overlayPos}
              overlaySize={overlaySize}
              qrCodeBase64={qrCodeWithVendor}
              showQROverlay={showQROverlay}
              onOverlayPointerDown={onOverlayPointerDown}
              handleImagePointerDown={handleImagePointerDown}
              panPos={panPos}
              zoomLevel={zoomLevel}
              personName={personName}
            />

            {/* Controls for poster preview: X, Y, Size sliders */}
            {previewMode === 'poster' && (posterPreviewValue || customPoster) && (
              <>
                <div className="text-sm font-medium text-gray-700 mt-4 mb-3">Ajustar QR Code</div>
                <div className="mt-3 flex flex-col gap-3">
                  <SliderControl label="Mover X" min={0} max={100} step={0.5} value={Math.round(overlayCenter.x * 100 * 2) / 2} onChange={(v) => setOverlayCenter((c) => ({ ...c, x: v / 100 }))} display={`${Math.round(overlayCenter.x * 100)}%`} />
                  <SliderControl label="Mover Y" min={0} max={100} step={0.5} value={Math.round(overlayCenter.y * 100 * 2) / 2} onChange={(v) => setOverlayCenter((c) => ({ ...c, y: v / 100 }))} display={`${Math.round(overlayCenter.y * 100)}%`} />
                  <SliderControl label="Tamanho QR" min={5} max={50} step={0.5} value={overlaySizePercent} onChange={(v) => setOverlaySizePercent(v)} display={`${overlaySizePercent}%`} />
                </div>
              </>
            )}
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
    </div>
  );
}
