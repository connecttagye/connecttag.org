const ENABLE_CACHE = true;
const CACHE_NAME = 'connecttag-cache-v58';
const OFFLINE_URL = 'https://connecttag.org/offline';

const ASSETS_TO_CACHE = [
  'https://connecttag.org/',
  'https://connecttag.org/offline',
  'https://connecttag.org/manifest.json',
  'https://connecttag.org/favicon.webp',
  'https://connecttag.org/icon-192.png',
  'https://connecttag.org/icon-512.png',
  'https://connecttag.org/assets/css/styles.min.css?v=1.1.4',
  'https://connecttag.org/assets/css/shared-styles.css?v=1.1.4',
  'https://connecttag.org/assets/js/components/components-bundle.js?v=1.1.4',
  'https://connecttag.org/assets/js/components/pwa-install-prompt.js?v=1.1.4',
  'https://connecttag.org/assets/js/components/site-author-box.js?v=1.1.4'
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
  console.log('SW: Activate Event - Cleaning up old caches');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => {
            console.log('SW: Deleting old cache:', key);
            return caches.delete(key);
        })
      );
    }).then(() => {
        console.log('SW: Now controlling all clients');
        return self.clients.claim();
    })
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
