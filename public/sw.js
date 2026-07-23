const STATIC_CACHE = "pull-static-v3";
const MAP_CACHE = "pull-map-v1";
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon",
  "/apple-icon",
  "/icon.svg",
  "/apple-icon.svg",
];

async function trimCache(cache, maximumEntries) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maximumEntries)).map((key) => cache.delete(key)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
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
      Promise.all(keys.filter((key) => ![STATIC_CACHE, MAP_CACHE].includes(key)).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.hostname.endsWith(".tile.openstreetmap.org")) {
    event.respondWith(
      caches.open(MAP_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) {
          await cache.put(event.request, response.clone());
          await trimCache(cache, 150);
        }
        return response;
      }),
    );
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/")));
    return;
  }

  if (url.origin === self.location.origin && ["image", "font", "style", "script"].includes(event.request.destination)) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  }
});
