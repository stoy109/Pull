const CACHE_NAME = "pull-pwa-v2";
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon",
  "/apple-icon",
  "/icon.svg",
  "/apple-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });

            if (response.ok) {
              await cache.put(url, response);
            }
          } catch {
            // Optional precache entries should not block service worker install.
          }
        }),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((response) => response || caches.match("/"))),
  );
});
