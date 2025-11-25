// Service Worker para cache offline
const CACHE_NAME = 'roteiro-leblon-v3';
const urlsToCache = [
  '/',
  '/images/logo-round-white-w192.png',
  '/images/logo-round-white-w512.png',
  '/images/logo-puc-rio.png',
  '/data/arvores.json',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Cache populado com sucesso');
        return self.skipWaiting();
      })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se encontrado
        if (response) {
          console.log('Cache hit:', event.request.url);
          return response;
        }

        // Senão, buscar da rede e cachear
        console.log('Cache miss, buscando da rede:', event.request.url);
        return fetch(event.request).then((response) => {
          // Verificar se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar a resposta para cachear
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Cachear apenas páginas de árvores e recursos estáticos
              if (event.request.url.includes('/arvore/') ||
                  event.request.url.includes('/images/') ||
                  event.request.url.includes('/data/') ||
                  event.request.url === self.location.origin + '/') {
                cache.put(event.request, responseToCache);
                console.log('Recurso cacheado:', event.request.url);
              }
            });

          return response;
        }).catch(() => {
          // Se falhar, retornar página offline para navegação
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});
