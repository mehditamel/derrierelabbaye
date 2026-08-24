import bundleAnalyzer from "@next/bundle-analyzer";

// En-têtes de sécurité appliqués à toutes les routes (bonnes pratiques + score
// « best-practices » Lighthouse). N'affecte pas le plan Google Maps embarqué :
// X-Frame-Options contrôle l'inclusion de NOS pages dans un cadre tiers, pas
// l'iframe que l'on héberge.
/* Content-Security-Policy — volontairement pragmatique.
   `script-src` garde 'unsafe-inline' : le site émet du JSON-LD en script inline
   sur trois pages, et Next injecte ses propres scripts d'hydratation. Les
   remplacer par un nonce imposerait un rendu à chaque requête, ce qui
   détruirait le `revalidate = 86400` de l'accueil et de la PWA — un coût réel
   pour un gain théorique, aucune de ces données n'étant fournie par un tiers.
   Idem pour `style-src`, à cause des attributs `style=` rendus côté serveur.
   Tout le reste est verrouillé. */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  // Remplace X-Frame-Options, conservé en dessous pour les navigateurs anciens.
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // Le plan du quartier est un iframe Google Maps (cf. site.adresse.embedUrl).
  "frame-src https://www.google.com",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Une demande de réservation ne doit jamais être servie depuis un cache
      // (proxy, navigateur) : chaque envoi doit atteindre la fonction.
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

// Analyse de bundle activée à la demande : `ANALYZE=true npm run build`.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
