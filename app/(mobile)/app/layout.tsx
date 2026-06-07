import type { Metadata, Viewport } from "next";
import { TabBar } from "@/components/mobile/TabBar";
import { PwaRegister } from "@/components/mobile/PwaRegister";
import { OfflineBanner } from "@/components/mobile/OfflineBanner";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import "./app-shell.css";

export const metadata: Metadata = {
  title: { absolute: "L'app — Derrière l'Abbaye" },
  description:
    "La carte, la réservation et la fidélité de Derrière l'Abbaye, dans la poche.",
  alternates: { canonical: "/app" },
  // Coque PWA : duplique le contenu public → non indexée (les liens restent suivis).
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#14110d",
  width: "device-width",
  initialScale: 1,
};

export default function MobileAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-root">
      <PwaRegister />
      <OfflineBanner />
      <div className="app-screen">{children}</div>
      <InstallPrompt />
      <TabBar />
    </div>
  );
}
