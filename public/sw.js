/* Service worker minimal — coque hors-ligne pour la PWA Derrière l'Abbaye.
   Stratégie : network-first pour la navigation (toujours frais si en ligne),
   stale-while-revalidate pour les assets (immédiat depuis le cache, rafraîchi
   en arrière-plan). Pré-cacher les chunks /_next/static au runtime rend la
   carte réellement consultable hors-ligne (au lieu de retomber sur offline.html). */

const CACHE = "dla-shell-v5";
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
  // hors-ligne autoporteuse. Les chunks /_next/static étant mis en cache au
  // fil de l'eau (ci-dessous), une page déjà visitée se rouvre hors-ligne.
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

  // Assets : stale-while-revalidate. On sert immédiatement la version en cache
  // et on rafraîchit en arrière-plan ; sinon on va au réseau et on met en cache.
  // Évite de servir indéfiniment de vieux assets (l'ancien cache-first figé).
  event.respondWith(
    caches.match(request).then((cached) => {
      const reseau = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || reseau;
    })
  );
});
