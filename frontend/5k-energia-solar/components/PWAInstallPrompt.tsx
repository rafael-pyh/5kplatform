'use client';

import { usePWA } from '@/hooks/usePWA';
import { useState, useEffect } from 'react';
import { Button } from './ui';

export function PWAInstallPrompt() {
  const { installPrompt, install, isInstalled, isOnline } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const savedDismissed = localStorage.getItem('pwa_install_dismissed');
    if (savedDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (installPrompt && !isInstalled && !dismissed) {
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
    // Salvar a dismissão no localStorage por 30 dias
    localStorage.setItem('pwa_install_dismissed', 'true');
    localStorage.setItem('pwa_install_dismissed_date', new Date().toISOString());
  };

  if (!showPrompt || !installPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 bg-linear-to-r from-blue-50 to-green-50 text-gray-800 border border-gray-300 rounded-lg shadow-2xl p-4 z-50 max-w-sm mx-auto"
      role="dialog"
      aria-label="Prompt de instalação do aplicativo"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Instalar 5K Energia Solar
          </h3>
          <p className="text-sm text-gray-700">
            Baixe nosso app para acessar rápido como um app nativo
          </p>
        </div>
      </div>

      <div className="w-full flex gap-2 mt-4">
        <Button
          onClick={handleInstall}
          variant="gradient"
          aria-label="Instalar aplicativo"
          className="w-1/2"
        >
          Instalar
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline-blue"
          aria-label="Descartar prompt"
          className="w-1/2"
        >
          Depois
        </Button>
      </div>

      {!isOnline && (
        <div className="mt-3 text-xs text-yellow-200 bg-blue-800 rounded px-2 py-1">
          ⚠️ Você está offline. O app será mais útil quando online.
        </div>
      )}
    </div>
  );
}
