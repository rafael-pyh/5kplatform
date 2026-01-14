'use client';

import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

/**
 * Exemplo de como usar o hook usePWA em seus componentes
 */
export function PWAStatusExample() {
  const {
    installPrompt,
    install,
    isInstalled,
    isOnline,
    swReady,
    requestNotificationPermission,
    subscribePushNotifications,
  } = usePWA();

  const [notificationPermission, setNotificationPermission] = useState(false);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted);

    if (granted) {
      const subscription = await subscribePushNotifications();
      if (subscription) {
        // Aqui você poderia enviar a subscription para seu backend
        // await fetch('/api/notifications/subscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ subscription })
        // });
      }
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Status do PWA</h2>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-3 rounded ${swReady ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <p className="text-sm font-semibold">Service Worker</p>
          <p className="text-xs">{swReady ? '✅ Ativo' : '⏳ Carregando'}</p>
        </div>

        <div className={`p-3 rounded ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
          <p className="text-sm font-semibold">Conexão</p>
          <p className="text-xs">{isOnline ? '✅ Online' : '❌ Offline'}</p>
        </div>

        <div className={`p-3 rounded ${isInstalled ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <p className="text-sm font-semibold">Instalado</p>
          <p className="text-xs">{isInstalled ? '✅ Sim' : '❌ Não'}</p>
        </div>

        <div className={`p-3 rounded ${installPrompt ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <p className="text-sm font-semibold">Pronto Instalar</p>
          <p className="text-xs">{installPrompt ? '✅ Sim' : '❌ Não'}</p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-2">
        {installPrompt && !isInstalled && (
          <button
            onClick={install}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Instalar Aplicativo
          </button>
        )}

        <button
          onClick={handleRequestNotifications}
          className={`w-full px-4 py-2 rounded font-semibold ${
            notificationPermission
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
          disabled={notificationPermission}
        >
          {notificationPermission ? '✅ Notificações Ativas' : 'Ativar Notificações'}
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-semibold"
        >
          Recarregar Página
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
        <p className="font-semibold mb-2">💡 Informações:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Service Worker cachea recursos para funcionar offline</li>
          <li>App pode ser instalado em homescreen do celular</li>
          <li>Notificações push podem ser ativadas</li>
          <li>Sincronização em background quando voltar online</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Exemplo simples de botão de instalação
 */
export function SimpleInstallButton() {
  const { install, installPrompt, isInstalled } = usePWA();

  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <button
      onClick={install}
      className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow"
    >
      ⬇️ Instalar App
    </button>
  );
}

/**
 * Exemplo de indicador de status offline
 */
export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center font-semibold z-50">
      ⚠️ Você está offline. Alguns recursos podem não estar disponíveis.
    </div>
  );
}
