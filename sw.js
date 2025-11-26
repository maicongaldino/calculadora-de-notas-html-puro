// Service Worker simples para PWA
const CACHE_NAME = 'calculadora-notas-v1';
const URLS_PARA_CACHE = [
  './',
  './index.html',
  './css/estilos.css',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(URLS_PARA_CACHE.map(async (url) => {
        try {
          const resp = await fetch(url, { cache: 'no-cache' });
          if (resp && resp.ok) {
            await cache.put(url, resp.clone());
          }
        } catch { }
      }));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  event.respondWith(
    caches.match(request).then((response) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Não cacheia requisições de navegação com query/hash, para evitar problemas
          const url = new URL(request.url);
          const isGet = request.method === 'GET';
          const isSameOrigin = url.origin === self.location.origin;
          if (isGet && isSameOrigin) {
            cache.put(request, clone).catch(() => { });
          }
        });
        return networkResponse;
      }).catch(() => response);
      return response || fetchPromise;
    })
  );
});
