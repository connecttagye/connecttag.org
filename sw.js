const ENABLE_CACHE = true;
const CACHE_NAME = 'connecttag-cache-undefined';
const OFFLINE_URL = 'https://connecttag.org/offline';
const MAX_CACHE_ENTRIES = 120;

async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const excess = keys.length - maxItems;
      for (let i = 0; i < excess; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (e) {}
}

const ASSETS_TO_CACHE = [
  'https://connecttag.org/',
  'https://connecttag.org/offline',
  'https://connecttag.org/manifest.json',
  'https://connecttag.org/favicon.webp',
  'https://connecttag.org/icon-192.webp',
  'https://connecttag.org/icon-512.webp',
  'https://connecttag.org/assets/css/bootstrap.min.css?v=1.1.60',
  'https://connecttag.org/assets/css/styles.min.css?v=1.1.60',
  'https://connecttag.org/assets/css/components.min.css?v=1.1.60',
  'https://connecttag.org/assets/css/shared-styles.css?v=1.1.60',
  'https://connecttag.org/assets/css/fontawesome.min.css?v=1.1.60',
  'https://connecttag.org/assets/js/components/components-bundle.js?v=1.1.60',
  'https://connecttag.org/assets/fonts/cairo-arabic.woff2?v=1.1.60',
  'https://connecttag.org/assets/fonts/cairo-latin.woff2?v=1.1.60',
  'https://connecttag.org/assets/fonts/fa-solid-900.woff2?v=1.1.60',
  'https://connecttag.org/assets/fonts/fa-brands-400.woff2?v=1.1.60',
  'https://connecttag.org/assets/fonts/fa-regular-400.woff2?v=1.1.60'
];

// Install Event
self.addEventListener('install', event => {
  if (!ENABLE_CACHE) return self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(ASSETS_TO_CACHE.map(url => cache.add(url))))
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

// Fetch Event - CacheFirst for immutable versioned assets & fonts, NetworkFirst for HTML/documents
self.addEventListener('fetch', event => {
  if (!ENABLE_CACHE) return;
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isImmutableAsset = url.pathname.endsWith('.woff2') || (url.pathname.startsWith('/assets/') && url.search.includes('v='));

  if (isImmutableAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cachedRes => {
          if (cachedRes) return cachedRes;
          return fetch(event.request).then(networkRes => {
            if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
              cache.put(event.request, networkRes.clone());
            }
            return networkRes;
          });
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkRes => {
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resClone).then(() => trimCache(CACHE_NAME, MAX_CACHE_ENTRIES));
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
