import { useEffect, useState } from 'react';
import { composePosterDataUrl } from '../lib/composePoster';

interface UsePosterPreviewProps {
  previewMode: 'qr' | 'poster' | 'create';
  qrCodeBase64: string;
  customPoster: string | null;
  boxCenterXRatio?: number;
  boxCenterYRatio?: number;
  boxSizeRatio?: number;
}

export default function usePosterPreview({ previewMode, qrCodeBase64, customPoster, boxCenterXRatio, boxCenterYRatio, boxSizeRatio }: UsePosterPreviewProps) {
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (previewMode === 'poster') {
      if (customPoster) {
        if (mounted) setPosterPreview(null);
      } else {
        const opts: any = { outputWidth: 900 };
        if (typeof boxCenterXRatio === 'number') opts.boxCenterXRatio = boxCenterXRatio;
        if (typeof boxCenterYRatio === 'number') opts.boxCenterYRatio = boxCenterYRatio;
        if (typeof boxSizeRatio === 'number') opts.boxSizeRatio = boxSizeRatio;
        // default ratios if not provided
        if (!opts.boxCenterXRatio) opts.boxCenterXRatio = 0.5;
        if (!opts.boxCenterYRatio) opts.boxCenterYRatio = 0.4;
        if (!opts.boxSizeRatio) opts.boxSizeRatio = 0.22;

        composePosterDataUrl(qrCodeBase64, opts)
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
  }, [previewMode, qrCodeBase64, customPoster, boxCenterXRatio, boxCenterYRatio, boxSizeRatio]);

  return { posterPreview, setPosterPreview };
}
