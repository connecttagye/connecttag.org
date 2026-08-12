const ENABLE_CACHE = true;
const CACHE_NAME = 'connecttag-cache-v18';
const OFFLINE_URL = '/offline.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.webp',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/css/styles.min.css',
  '/assets/css/shared-styles.css',
  '/assets/js/components/components-bundle.js',
  '/assets/js/components/pwa-install-prompt.js'
];

// Install Event
self.addEventListener('install', event => {
  if (!ENABLE_CACHE) return self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching initial assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First Strategy
self.addEventListener('fetch', event => {
  if (!ENABLE_CACHE) return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkRes => {
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(event.request).then(cacheRes => {
          if (cacheRes) return cacheRes;
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});
