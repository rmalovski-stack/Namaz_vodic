const CACHE = 'namaz-reshat-v2';
const ASSETS = [
  './',
  './index.html',
  './vodic-namaz.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => {
          if (event.request.method === 'GET' && resp.status === 200) {
            cache.put(event.request, copy);
          }
        });
        return resp;
      }).catch(() => caches.match('./index.html') || caches.match('./vodic-namaz.html'));
    })
  );
});
