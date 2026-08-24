/* Service worker minimal — coque hors-ligne pour la PWA Derrière l'Abbaye.
   Stratégie : network-first pour la navigation (toujours frais si en ligne),
   stale-while-revalidate pour les assets (immédiat depuis le cache, rafraîchi
   en arrière-plan). Pré-cacher les chunks /_next/static au runtime rend la
   carte réellement consultable hors-ligne (au lieu de retomber sur offline.html). */

const CACHE = "dla-shell-v5";

/* Cache d'exécution, séparé de la coque : il accumule les chunks /_next/static
   rencontrés au fil de la navigation. Chaque déploiement en apporte un jeu
   neuf ; sans plafond, il croît indéfiniment jusqu'au prochain changement
   manuel de version — et sur iOS, où le quota d'origine est serré, l'éviction
   finit par emporter TOUT le cache, coque comprise. */
const RUNTIME = "dla-runtime-v1";
const RUNTIME_MAX = 60;

/** Rogne le cache d'exécution en supprimant les entrées les plus anciennes. */
async function limiterRuntime() {
  const cache = await caches.open(RUNTIME);
  const cles = await cache.keys();
  // `keys()` renvoie les entrées dans leur ordre d'insertion.
  for (const cle of cles.slice(0, Math.max(0, cles.length - RUNTIME_MAX))) {
    await cache.delete(cle);
  }
}
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
  //
  // Chaque URL est mise en cache indépendamment : `cache.addAll` est atomique,
  // si UNE seule des dix échoue (déploiement en cours, route renommée),
  // l'installation entière est rejetée et la PWA perd le hors-ligne, sans le
  // moindre signal. Mieux vaut une coque incomplète qu'aucune coque.
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(
        SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[sw] pré-cache impossible :", url, err);
          })
        )
      )
    )
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
        Promise.all(
          keys.filter((k) => k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k))
        )
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
            caches
              .open(RUNTIME)
              .then((cache) => cache.put(request, copy).then(limiterRuntime))
              .catch(() => {});
          }
          return response;
        })
        // Ni cache ni réseau : on renvoie une réponse d'erreur explicite.
        // `respondWith` d'une promesse résolue à `undefined` lève une exception
        // et noie la vraie cause dans un bruit de console trompeur.
        .catch(
          () =>
            cached ||
            new Response("Ressource indisponible hors-ligne", {
              status: 504,
              statusText: "Gateway Timeout",
            })
        );
      return cached || reseau;
    })
  );
});
