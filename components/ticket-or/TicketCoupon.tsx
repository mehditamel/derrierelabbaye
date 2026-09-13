"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Expand, Wine, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { type Ticket, ticketDate } from "@/lib/ticket-or/types";
import { INSPIRATIONS } from "./CocktailPreview";
import { TicketQr } from "./TicketQr";
import styles from "./TicketOr.module.css";

export function TicketCoupon({ ticket, preview = false }: { ticket: Ticket; preview?: boolean }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const usable =
    preview ||
    (!ticket.redeemed_at && !!ticket.expires_at && new Date(ticket.expires_at) > new Date());
  const expiry = preview
    ? "Cet exemple ne peut pas être échangé au bar."
    : ticket.redeemed_at
      ? `Utilisé le ${ticketDate(ticket.redeemed_at)} · bon déjà servi`
      : usable
        ? `À utiliser avant le ${ticketDate(ticket.expires_at!)} · une seule fois`
        : "Bon expiré · non utilisable";
  const choice = INSPIRATIONS[ticket.flavour];
  const version = ticket.alcohol ? "Avec alcool · 18+" : "Sans alcool";

  useEffect(() => {
    const el = dialog.current;
    if (!open || !el) return;
    const returnFocus = trigger.current;
    const overflow = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (el.open) el.close();
      document.body.style.overflow = overflow;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [open]);

  const summary = (
    <div className={styles.couponChoice}>
      <span>{preview ? "Votre inspiration dans cet aperçu" : "Votre inspiration enregistrée"}</span>
      <h3>{choice.title}</h3>
      <p>{version}</p>
    </div>
  );

  return (
    <>
      <section
        aria-label="Votre bon"
        className={`${styles.coupon} ${preview ? styles.specimen : ""}`}
      >
        <div className={styles.couponHead}>
          <span>{preview ? "BON DE DÉMONSTRATION" : "UN COCKTAIL SIGNATURE OFFERT"}</span>
          <Wine size={22} strokeWidth={1} aria-hidden="true" />
        </div>
        {summary}
        {usable && ticket.code && <TicketQr code={ticket.code} preview={preview} />}
        <p className={styles.couponValidity}>{expiry}</p>
        {usable && ticket.code && (
          <button
            ref={trigger}
            className={styles.presentCoupon}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <Expand size={18} aria-hidden="true" />
            {preview ? "Agrandir le bon de démonstration" : "Présenter mon bon au comptoir"}
          </button>
        )}
      </section>
      <dialog
        ref={dialog}
        className={styles.couponDialog}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const items = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]")
          );
          const first = items[0],
            last = items.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        {open && (
          <div className={styles.couponViewer}>
            <div className={styles.couponViewerHead}>
              <Logo tone="noir" width={106} />
              <button
                type="button"
                aria-label="Fermer le bon agrandi"
                onClick={() => setOpen(false)}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <h2 id={titleId}>{preview ? "Le bon, côté comptoir." : "Votre moment est arrivé."}</h2>
            <p className={styles.viewerIntro}>
              {preview
                ? "Démonstration · aucun cocktail à retirer"
                : "Présentez ce QR code à l’équipe avant de commander."}
            </p>
            {summary}
            {ticket.code && <TicketQr code={ticket.code} preview={preview} />}
            <p className={styles.couponValidity}>{expiry}</p>
            <div className={styles.viewerFoot}>
              <Check size={16} aria-hidden="true" />
              <span>
                {preview
                  ? "Aperçu uniquement · sans valeur"
                  : "Le service est confirmé par l’équipe."}
              </span>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
