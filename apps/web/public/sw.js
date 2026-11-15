// Teepha Flowers and Fabrics — Service Worker & Push Notification Handler
const CACHE_NAME = 'teepha-cache-v1';
const ASSETS_TO_PRECACHE = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/favicon.ico',
];

// Install: precache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_PRECACHE))
      .catch(() => {}),
  );
  self.skipWaiting();
});

// Activate: clean up old caches and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch: Stale-while-revalidate for static assets, network-first for navigation & API
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls from caching
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/v1')
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    }),
  );
});

// Push Event: Handle incoming Web Push notifications from Teepha backend
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    payload = {
      title: 'Teepha Flowers & Fabrics',
      body: event.data
        ? event.data.text()
        : 'Exclusive update from your Teepha Concierge.',
    };
  }

  const title = payload.title || 'Teepha Flowers & Fabrics';
  const options = {
    body:
      payload.body ||
      'You have an exclusive update regarding your order or bespoke fitting.',
    icon: payload.icon || '/icons/icon.svg',
    badge: payload.badge || '/icons/icon.svg',
    data: {
      url: payload.url || (payload.data && payload.data.url) || '/',
      timestamp: Date.now(),
    },
    vibrate: [150, 60, 150, 60, 250],
    actions: payload.actions || [
      { action: 'open_order', title: '⚜ View Order' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: payload.tag || 'teepha-alert',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click: Navigate client to relevant screen (order detail, feed, or support)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
