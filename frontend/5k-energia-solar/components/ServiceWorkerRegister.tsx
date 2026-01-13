'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registrado com sucesso:', registration);

            // Verificar por atualizações a cada 1 hora
            const updateCheckInterval = setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);

            // Limpar interval ao desmontar
            return () => clearInterval(updateCheckInterval);
          })
          .catch((error) => {
            console.log('Erro ao registrar Service Worker:', error);
          });

        // Detectar atualização do Service Worker
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        // Mensagem para atualizar o Service Worker
        const checkForUpdates = () => {
          navigator.serviceWorker.ready.then((registration) => {
            registration.update().catch(() => {
              // Erro na verificação de atualização
            });
          });
        };

        // Verificar atualizações a cada 30 minutos
        setInterval(checkForUpdates, 30 * 60 * 1000);
      });
    }
  }, []);

  return null;
}
