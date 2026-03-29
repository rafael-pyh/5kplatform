'use client';

import { useEffect, useState } from 'react';

export interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    // Detectar instalação
    const isStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
      );
    };

    setIsInstalled(isStandalone());

    // Eventos de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detectar online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSwReady(true);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    
    try {
      await installPrompt.prompt();
      const _choice = await installPrompt.userChoice;
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const subscribePushNotifications = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        return subscription;
      }

      // Aqui você precisaria configurar as VAPID public keys no backend
      // const response = await fetch('/api/notifications/vapid-public-key');
      // const { vapidPublicKey } = await response.json();

      // const newSubscription = await registration.pushManager.subscribe({
      //   userVisibleOnly: true,
      //   applicationServerKey: vapidPublicKey,
      // });

      // return newSubscription;
      return null;
    } catch (error) {
      console.error('Erro ao se inscrever em notificações:', error);
      return null;
    }
  };

  return {
    installPrompt,
    install,
    isInstalled,
    isOnline,
    swReady,
    requestNotificationPermission,
    subscribePushNotifications,
  };
}
