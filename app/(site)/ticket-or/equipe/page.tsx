import type { Metadata } from "next";
import { StaffDesk } from "@/components/ticket-or/StaffDesk";
import { configured } from "@/lib/ticket-or/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Le comptoir — Ticket d’Or",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function TicketStaffPage() {
  return <StaffDesk preview={!configured()} />;
}
