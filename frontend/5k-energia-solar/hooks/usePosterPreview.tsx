import { useEffect, useState } from 'react';
import { composePosterDataUrl } from '../lib/composePoster';

interface UsePosterPreviewProps {
  previewMode: 'qr' | 'poster' | 'create';
  qrCodeBase64: string;
  customPoster: string | null;
}

export default function usePosterPreview({ previewMode, qrCodeBase64, customPoster }: UsePosterPreviewProps) {
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (previewMode === 'poster') {
      if (customPoster) {
        if (mounted) setPosterPreview(null);
      } else {
        composePosterDataUrl(qrCodeBase64, { outputWidth: 900, boxCenterXRatio: 0.5, boxCenterYRatio: 0.4, boxSizeRatio: 0.22 })
          .then((dataUrl) => {
            if (mounted) setPosterPreview(dataUrl);
          })
          .catch((err) => {
            console.error('Erro ao compor preview da placa:', err);
            if (mounted) setPosterPreview(null);
          });
      }
    } else {
      if (mounted) setPosterPreview(null);
    }

    return () => {
      mounted = false;
    };
  }, [previewMode, qrCodeBase64, customPoster]);

  return { posterPreview, setPosterPreview };
}
