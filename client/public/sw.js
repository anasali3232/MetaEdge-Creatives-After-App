const CACHE_NAME = "metaedge-team-v4";
const APP_SHELL = [
  "/team-portal/login",
  "/metaedge-icon-v2-192.png",
  "/metaedge-icon-v2-512.png",
  "/metaedge-touch-v2.png",
  "/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.match(/\.(js|css|png|jpg|webp|woff2|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone).catch(() => {}));
          }
          return response;
        }).catch(() => new Response("", { status: 503 }));
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone).catch(() => {}));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") {
            return caches.match("/team-portal/login").then((fallback) => {
              return fallback || new Response("You are offline. Please check your connection.", {
                status: 503,
                headers: { "Content-Type": "text/html" },
              });
            });
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
