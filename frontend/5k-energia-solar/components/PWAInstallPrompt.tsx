'use client';

import { usePWA } from '@/hooks/usePWA';
import { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
  const { installPrompt, install, isInstalled, isOnline } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (installPrompt && !isInstalled && !dismissed) {
      // Mostrar prompt após 3 segundos de uso
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [installPrompt, isInstalled, dismissed]);

  const handleInstall = async () => {
    await install();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
  };

  if (!showPrompt || !installPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl p-4 z-50 max-w-sm mx-auto"
      role="dialog"
      aria-label="Prompt de instalação do aplicativo"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">
            Instalar 5K Energia Solar
          </h3>
          <p className="text-sm text-blue-100">
            Baixe nosso app para acessar offline e rápido como um app nativo
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleInstall}
          className="flex-1 bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-blue-50 transition-colors"
          aria-label="Instalar aplicativo"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-blue-100 hover:text-white transition-colors rounded hover:bg-blue-500 bg-blue-600"
          aria-label="Descartar prompt"
        >
          Depois
        </button>
      </div>

      {!isOnline && (
        <div className="mt-3 text-xs text-yellow-200 bg-blue-800 rounded px-2 py-1">
          ⚠️ Você está offline. O app será mais útil quando online.
        </div>
      )}
    </div>
  );
}
