import bundleAnalyzer from "@next/bundle-analyzer";

// En-têtes de sécurité appliqués à toutes les routes (bonnes pratiques + score
// « best-practices » Lighthouse). N'affecte pas le plan Google Maps embarqué :
// X-Frame-Options contrôle l'inclusion de NOS pages dans un cadre tiers, pas
// l'iframe que l'on héberge.
const securityHeaders = [
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
