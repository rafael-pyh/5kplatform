// Service Worker para 5K Energia Solar PWA
const CACHE_NAME = 'v1-5k-energia-solar';
const RUNTIME_CACHE = 'runtime-cache';
const IMAGE_CACHE = 'image-cache';

// Assets para cache imediato na instalação
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/globals.css',
  '/5klogo.png',
  '/5klogo.ico',
];

// Instalar e cachear assets estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('Alguns assets não puderam ser cacheados:', "Cors policy");
      });
    })
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== IMAGE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de fetch com cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições para outros domínios (APIs externas)
  if (url.origin !== self.location.origin && !url.hostname.includes('backblazeb2.com') && !url.hostname.includes('localhost')) {
    return;
  }

  // Estratégia para imagens: cache-first, fallback para rede
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Retornar uma imagem placeholder se offline
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e0e0e0" width="200" height="200"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
        });
      })
    );
    return;
  }

  // Estratégia para documentos HTML: network-first, fallback para cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/');
          });
        })
    );
    return;
  }

  // Estratégia para scripts e styles: cache-first
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Estratégia padrão: network-first para APIs
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return response || new Response(
            JSON.stringify({ error: 'Offline - Recurso não disponível no cache' }),
            { headers: { 'Content-Type': 'application/json' }, status: 503 }
          );
        });
      })
  );
});

// Sincronização de background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Implementar lógica de sincronização de dados
      Promise.resolve()
    );
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova notificação',
      icon: '/5klogo2.png',
      badge: '/5klogo2.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
    };
    event.waitUntil(
      self.registration.showNotification(data.title || '5K Energia Solar', options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
