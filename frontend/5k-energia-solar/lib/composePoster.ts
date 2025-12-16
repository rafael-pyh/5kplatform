type ComposeOptions = {
  posterUrl?: string;
  outputWidth?: number; // px
  boxCenterXRatio?: number; // relative to width (0-1)
  boxCenterYRatio?: number; // relative to height (0-1)
  boxSizeRatio?: number; // relative to width (0-1)
  maxBoxSizePx?: number; // optional cap for final QR size in pixels
};

export async function composePosterDataUrl(qrBase64: string, opts?: ComposeOptions): Promise<string> {
  const posterUrl = opts?.posterUrl ?? '/placa_cliente.png';
  const outputWidth = opts?.outputWidth ?? 2048;

  const poster = new window.Image();
  poster.crossOrigin = 'anonymous';
  poster.src = posterUrl;

  const qrImg = new window.Image();
  qrImg.crossOrigin = 'anonymous';
  qrImg.src = qrBase64;

  const waitImage = (img: HTMLImageElement) =>
    new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });

  await Promise.all([waitImage(poster), waitImage(qrImg)]);

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = Math.round((poster.naturalHeight / poster.naturalWidth) * outputWidth);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  ctx.drawImage(poster, 0, 0, canvas.width, canvas.height);

  // sensible defaults (can be overridden via opts)
  const boxCenterXRatio = opts?.boxCenterXRatio ?? 0.5; // center horizontally
  const boxCenterYRatio = opts?.boxCenterYRatio ?? 0.40; // tuned to align within white square
  const boxSizeRatio = opts?.boxSizeRatio ?? 0.22; // slightly larger to fill white area

  const boxCenterX = canvas.width * boxCenterXRatio;
  const boxCenterY = canvas.height * boxCenterYRatio;
  const maxBoxSize = opts?.maxBoxSizePx ?? 800;
  const boxSize = Math.min(canvas.width * boxSizeRatio, maxBoxSize);
  const boxX = Math.round(boxCenterX - boxSize / 2);
  const boxY = Math.round(boxCenterY - boxSize / 2);

  ctx.drawImage(qrImg, boxX, boxY, boxSize, boxSize);

  return canvas.toDataURL('image/png');
}

export async function composePosterBlob(qrBase64: string, opts?: ComposeOptions): Promise<Blob> {
  const dataUrl = await composePosterDataUrl(qrBase64, opts);
  const res = await fetch(dataUrl);
  return await res.blob();
}

export default composePosterDataUrl;
