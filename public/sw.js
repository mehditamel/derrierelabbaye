/* Service worker minimal — coque hors-ligne pour la PWA Derrière l'Abbaye.
   Stratégie : network-first pour la navigation (toujours frais si en ligne),
   cache-first pour les assets statiques. */

const CACHE = "dla-shell-v4";
const SHELL = [
  "/",
  "/app",
  "/app/carte",
  "/app/reserver",
  "/app/fidelite",
  "/offline.html",
  "/manifest.webmanifest",
  "/logo-cream.png",
  "/logo-noir.png",
  "/enseigne.jpeg",
];

self.addEventListener("install", (event) => {
  // On pré-cache la coque sans forcer l'activation : la mise à jour attend
  // un geste explicite de l'utilisateur (message SKIP_WAITING).
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
});

// Activation immédiate du nouveau worker sur demande (toast « Recharger »).
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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

  // Navigation : réseau d'abord, repli sur la page visitée puis la page
  // hors-ligne autoporteuse (servir /app sans ses assets rendrait une coque
  // cassée : les /_next/static/* ne sont pas pré-cachés).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(request, { ignoreSearch: true })
          .then((r) => r || caches.match("/offline.html"))
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
