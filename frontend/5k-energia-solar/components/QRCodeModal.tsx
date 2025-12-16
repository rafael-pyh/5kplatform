 'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { composePosterBlob } from '../lib/composePoster';
import SliderControl from './SliderControl';
import PosterPreview from './PosterPreview';
import useModalEscape from '@/hooks/useModalEscape';
import usePosterPreview from '@/hooks/usePosterPreview';
import useOverlayDrag from '@/hooks/useOverlayDrag';
import useImagePanZoom from '@/hooks/useImagePanZoom';
import ModalHeader from '@/components/ModalHeader';
import ModeSelector from '@/components/ModeSelector';
import ActionButtons from '@/components/ActionButtons';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeBase64: string; // Base64 data URL
  personName: string;
  qrCode?: string;
}

export default function QRCodeModal({ isOpen, onClose, qrCodeBase64, personName, qrCode }: QRCodeModalProps) {
  const [resolution, setResolution] = useState<number | 'original'>(512);
  const [previewMode, setPreviewMode] = useState<'qr' | 'poster' | 'create'>('qr');
  const [customPoster, setCustomPoster] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlaySize, setOverlaySize] = useState<number>(140); // px in preview
  const [overlayCenter, setOverlayCenter] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.4 }); // relative (0-1)
  const [overlaySizePercent, setOverlaySizePercent] = useState<number>(22); // percent of preview width
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showQROverlay, setShowQROverlay] = useState<boolean>(false);
  // manage escape key and body overflow
  useModalEscape(isOpen, onClose);

  // poster preview generator hook (handles auto composition when not using customPoster)
  const posterPreviewHook = usePosterPreview({
    previewMode,
    qrCodeBase64,
    customPoster,
    boxCenterXRatio: overlayCenter.x,
    boxCenterYRatio: overlayCenter.y,
    boxSizeRatio: overlaySizePercent / 100,
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
      img.src = qrCodeBase64;
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

        // If the image is transformed (zoom/pan in create mode), compute the mapping
        const natW = posterImg.naturalWidth || posterImg.width;
        const natH = posterImg.naturalHeight || posterImg.height;
        const previewRect = previewRef.current.getBoundingClientRect();

        // base fit scale used by object-contain
        const baseScale = Math.min(previewRect.width / natW, previewRect.height / natH);
        const finalImgW = natW * baseScale * (previewMode === 'create' ? zoomLevel : 1);
        const finalImgH = natH * baseScale * (previewMode === 'create' ? zoomLevel : 1);

        // image center in page coords (object-contain centers the image in the container)
        const imgCenterX = previewRect.left + previewRect.width / 2 + (previewMode === 'create' ? panPos.x : 0);
        const imgCenterY = previewRect.top + previewRect.height / 2 + (previewMode === 'create' ? panPos.y : 0);

        const imgLeft = imgCenterX - finalImgW / 2;
        const imgTop = imgCenterY - finalImgH / 2;

        const overlayCenterX = overlayRect.left + overlayRect.width / 2;
        const overlayCenterY = overlayRect.top + overlayRect.height / 2;

        const localX = (overlayCenterX - imgLeft) / finalImgW;
        const localY = (overlayCenterY - imgTop) / finalImgH;
        const boxSizeRatio = overlayRect.width / finalImgW;

        const boxCenterXRatio = Math.max(0, Math.min(1, localX));
        const boxCenterYRatio = Math.max(0, Math.min(1, localY));

        const blob = await composePosterBlob(qrCodeBase64, {
          outputWidth: 2048,
          posterUrl: customPoster,
          boxCenterXRatio,
          boxCenterYRatio,
          boxSizeRatio,
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

  const handleSaveAndDownload = async () => {
    try {
      if (!customPoster || !previewRef.current) {
        toast.error('Faça upload da placa antes de salvar.');
        return;
      }

      if (!showQROverlay || !overlayRef.current) {
        toast.error('Adicione e posicione o QR Code antes de salvar.');
        return;
      }

      const previewRect = previewRef.current.getBoundingClientRect();
      const overlayRect = overlayRef.current.getBoundingClientRect();

      // Find the poster image element inside preview (exclude the QR overlay image)
      const imgEl = previewRef.current.querySelector('img[alt="Poster custom"]') as HTMLImageElement | null;
      // fallback: use first img that's not the overlay
      const firstImg = previewRef.current.querySelector('img:not([alt="QR overlay"])') as HTMLImageElement | null;
      const posterImg = imgEl || firstImg;
      if (!posterImg) {
        toast.error('Imagem da placa não encontrada para compor.');
        return;
      }

      // Use natural size and container fit to compute accurate mapping (accounts for object-contain + pan/zoom)
      const natW = posterImg.naturalWidth || posterImg.width;
      const natH = posterImg.naturalHeight || posterImg.height;
      const baseScale = Math.min(previewRect.width / natW, previewRect.height / natH);
      const finalImgW = natW * baseScale * (previewMode === 'create' ? zoomLevel : 1);
      const finalImgH = natH * baseScale * (previewMode === 'create' ? zoomLevel : 1);
      const imgCenterX = previewRect.left + previewRect.width / 2 + (previewMode === 'create' ? panPos.x : 0);
      const imgCenterY = previewRect.top + previewRect.height / 2 + (previewMode === 'create' ? panPos.y : 0);
      const imgLeft = imgCenterX - finalImgW / 2;
      const imgTop = imgCenterY - finalImgH / 2;

      const overlayCenterX = overlayRect.left + overlayRect.width / 2;
      const overlayCenterY = overlayRect.top + overlayRect.height / 2;
      const localX = (overlayCenterX - imgLeft) / finalImgW;
      const localY = (overlayCenterY - imgTop) / finalImgH;
      const boxSizeRatio = overlayRect.width / finalImgW;

      const boxCenterXRatio = Math.max(0, Math.min(1, localX));
      const boxCenterYRatio = Math.max(0, Math.min(1, localY));

      const blob = await composePosterBlob(qrCodeBase64, {
        outputWidth: 2048,
        posterUrl: customPoster,
        boxCenterXRatio,
        boxCenterYRatio,
        boxSizeRatio,
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

  const onOverlayPointerDown = (e: React.PointerEvent) => {
    if (!previewRef.current || !overlayRef.current) return;
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const offsetX = e.clientX - overlayRect.left;
    const offsetY = e.clientY - overlayRect.top;
    startOverlayDrag(e.clientX, e.clientY, offsetX, offsetY);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPosterUpload = (file: File | null) => {
    if (!file) return setCustomPoster(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setCustomPoster(dataUrl);
      setZoomLevel(1);
      setPanPos({ x: 0, y: 0 });
      setShowQROverlay(false);
    };
    reader.readAsDataURL(file);
  };

  // wheel zoom disabled in creation mode; zoom controlled via slider

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

        <ModeSelector previewMode={previewMode} setPreviewMode={setPreviewMode} />

        <div className="mb-4 flex justify-center">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 w-full">
            <PosterPreview
              previewMode={previewMode}
              previewRef={previewRef}
              overlayRef={overlayRef}
              customPoster={customPoster}
              posterPreview={posterPreviewValue}
              overlayPos={overlayPos}
              overlaySize={overlaySize}
              qrCodeBase64={qrCodeBase64}
              showQROverlay={showQROverlay}
              onOverlayPointerDown={onOverlayPointerDown}
              handleImagePointerDown={handleImagePointerDown}
              panPos={panPos}
              zoomLevel={zoomLevel}
            />

            {/* Upload + size control when in create mode */}
            {previewMode === 'create' && (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input id="posterUploadInput" type="file" accept="image/*" onChange={(e) => onPosterUpload(e.target.files ? e.target.files[0] : null)} className="hidden" />
                  <label htmlFor="posterUploadInput" className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center cursor-pointer">📁 Escolher imagem</label>
                </div>

                {customPoster && (
                  <>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 whitespace-nowrap">Zoom</label>
                      <input type="range" min={1} max={3} step={0.1} value={zoomLevel} onChange={(e) => setZoomLevel(Number(e.target.value))} className="flex-1" />
                      <span className="text-xs text-gray-500 w-8 text-right">{zoomLevel.toFixed(1)}x</span>
                    </div>

                    <button onClick={toggleQROverlay} className={`px-4 py-2 rounded-lg font-medium transition-colors ${showQROverlay ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {showQROverlay ? '✕ Remover QR Code' : '+ Adicionar QR Code'}
                    </button>

                    {showQROverlay && (
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 whitespace-nowrap">Tamanho QR</label>
                        <input type="range" min={40} max={220} value={overlaySize} onChange={(e) => setOverlaySize(Number(e.target.value))} className="flex-1" />
                        <span className="text-xs text-gray-500 w-8 text-right">{overlaySize}px</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Controls for poster preview: X, Y, Size sliders */}
            {previewMode === 'poster' && (posterPreviewValue || customPoster) && (
              <>
                Ajustar Qr Code
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
        </div>
      </div>
    </div>
  );
}
