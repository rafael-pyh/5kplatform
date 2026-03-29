type ComposeOptions = {
  posterUrl?: string;
  outputWidth?: number; // px
  boxCenterXRatio?: number; // relative to width (0-1)
  boxCenterYRatio?: number; // relative to height (0-1)
  boxSizeRatio?: number; // relative to width (0-1)
  maxBoxSizePx?: number; // optional cap for final QR size in pixels
  vendorName?: string; // name of the vendor to display below QR
};

// Function to add vendor name to QR code image
export async function addVendorNameToQRCode(qrBase64: string, vendorName: string): Promise<string> {
  const qrImg = new window.Image();
  qrImg.crossOrigin = 'anonymous';
  qrImg.src = qrBase64;

  const waitImage = (img: HTMLImageElement) =>
    new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });

  await waitImage(qrImg);

  // Create canvas with same size as QR + minimal space for text below
  const qrSize = qrImg.naturalWidth || qrImg.width;
  const textPadding = Math.round(qrSize * 0.05); // Minimal padding for text area
  
  const canvas = document.createElement('canvas');
  canvas.width = qrSize;
  canvas.height = qrSize + textPadding;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw QR code
  ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);

  // Draw vendor name below QR code
  const fontSize = Math.max(8, Math.round(qrSize * 0.03)); // 2% of QR size, min 8px
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const textX = canvas.width / 2;
  const textY = qrSize + 1; // Only 1px below QR code
  
  // Split long names into lines if needed
  const maxWidth = qrSize - 20;
  const lines = wrapText(ctx, vendorName, maxWidth);
  
  lines.forEach((line, index) => {
    ctx.fillText(line, textX, textY + (index * (fontSize + 2)));
  });

  return canvas.toDataURL('image/png');
}

// Helper function to wrap text
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

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
