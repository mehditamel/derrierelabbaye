import type { Metadata, Viewport } from "next";
import { TabBar } from "@/components/mobile/TabBar";
import { PwaRegister } from "@/components/mobile/PwaRegister";
import "./app-shell.css";

export const metadata: Metadata = {
  title: { absolute: "L'app — Derrière l'Abbaye" },
  description:
    "La carte, la réservation et la fidélité de Derrière l'Abbaye, dans la poche.",
  alternates: { canonical: "/app" },
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
      <div className="app-screen">{children}</div>
      <TabBar />
    </div>
  );
}
