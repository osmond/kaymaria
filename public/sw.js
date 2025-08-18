const CACHE = 'core-cache-v1';
const CORE_ASSETS = ['/', '/favicon.ico'];
const queue = [];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          if (CORE_ASSETS.some((a) => req.url.includes(a))) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        }).catch(() => cached)
      )
    );
  } else if (req.method === 'POST' && req.url.includes('/api/')) {
    event.respondWith(
      fetch(req.clone()).catch(async () => {
        const body = await req.clone().json().catch(() => null);
        queue.push({ url: req.url, body, headers: Array.from(req.headers.entries()) });
        return new Response(JSON.stringify({ queued: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
  }
});

self.addEventListener('sync', async () => {
  while (queue.length) {
    const item = queue.shift();
    await fetch(item.url, {
      method: 'POST',
      headers: Object.fromEntries(item.headers),
      body: JSON.stringify(item.body),
    });
  }
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Task Due', {
      body: data.body || '',
    })
  );
});
