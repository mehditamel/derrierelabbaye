/* Service worker minimal — coque hors-ligne pour la PWA Derrière l'Abbaye.
   Stratégie : network-first pour la navigation (toujours frais si en ligne),
   cache-first pour les assets statiques. */

const CACHE = "dla-shell-v2";
const SHELL = [
  "/",
  "/app",
  "/manifest.webmanifest",
  "/logo-cream.png",
  "/logo-noir.png",
  "/enseigne.jpeg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navigation : réseau d'abord, repli sur la page visitée puis la coque /app.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match("/app"))
      )
    );
    return;
  }

  // Assets : cache d'abord, sinon réseau (et on met en cache).
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
    )
  );
});
