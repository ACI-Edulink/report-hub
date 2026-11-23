// EduLink Reports Hub — Service Worker
// Strategy: network-first for the app shell, so any update you push to
// GitHub Pages is picked up the next time the installed app is opened —
// with a cached fallback so the app still opens if the network is down.

const CACHE_NAME = 'edulink-hub-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json'
];

// Install: pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean up old caches from previous versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first, falling back to cache when offline.
// This is what makes the installed app reflect your latest updates —
// it always tries the live GitHub Pages copy first.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
