"use client";
import { useMemo } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { site } from "@/data/site";
import styles from "./TicketOr.module.css";

export function TicketQr({ code, preview = false }: { code: string; preview?: boolean }) {
  const { path, size, svg } = useMemo(() => {
    const text = preview ? `${site.url}/ticket-or` : `${site.url}/ticket-or/equipe#bon=${code}`;
    const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
    const size = qr.modules.size + 8;
    let path = "";
    for (let y = 0; y < qr.modules.size; y++)
      for (let x = 0; x < qr.modules.size; x++)
        if (qr.modules.get(y, x)) path += `M${x + 4} ${y + 4}h1v1h-1z`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="white"/><path d="${path}" fill="#14110d"/></svg>`;
    return { path, size, svg };
  }, [code, preview]);
  return (
    <div className={styles.qrBlock}>
      <svg
        role="img"
        aria-label={
          preview
            ? "QR code de démonstration, sans valeur"
            : "QR code de votre bon à présenter à l’équipe"
        }
        viewBox={`0 0 ${size} ${size}`}
        className={styles.qr}
      >
        <rect width={size} height={size} fill="white" />
        <path d={path} fill="#14110d" />
      </svg>
      <p className={styles.couponCode}>{preview ? "SPÉCIMEN · SANS VALEUR" : code}</p>
      {!preview && (
        <a
          className={styles.textButton}
          href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
          download="mon-bon-abbaye.svg"
        >
          <Download size={16} aria-hidden="true" /> Enregistrer le QR code
        </a>
      )}
    </div>
  );
}
