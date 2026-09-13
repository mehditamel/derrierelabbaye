"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Download,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { Campaign, StaffTicket } from "@/lib/ticket-or/types";
import { extractCoupon, ticketDate } from "@/lib/ticket-or/types";
import styles from "./TicketOr.module.css";

type Stats = { campaign: Campaign | null; participants: number; redeemed: number };
async function staffApi(data?: Record<string, unknown>) {
  const res = await fetch(
    "/api/ticket-or/equipe",
    data
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      : { cache: "no-store" }
  );
  const value = await res.json();
  if (!res.ok) throw new Error(value.error || "Le contrôle du bon n’a pas abouti.");
  return value;
}

export function StaffDesk({ preview }: { preview: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ticket, setTicket] = useState<StaffTicket | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adultChecked, setAdultChecked] = useState(false);

  useEffect(() => {
    if (preview) return;
    let active = true;
    staffApi()
      .then(async (value) => {
        if (!active) return;
        setStats(value);
        const candidate = extractCoupon(window.location.href);
        if (candidate) {
          setCode(candidate);
          const found = await staffApi({ action: "lookup", code: candidate });
          if (active) {
            setTicket(found.ticket);
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [preview]);

  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }
  async function login(password: string) {
    await staffApi({ action: "login", password });
    setStats(await staffApi());
    const candidate = extractCoupon(window.location.href);
    if (candidate) {
      setCode(candidate);
      const found = await staffApi({ action: "lookup", code: candidate });
      setTicket(found.ticket);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }
  function example(status: StaffTicket["status"]) {
    setAdultChecked(false);
    setNotice("");
    setTicket({
      id: "demo",
      first_name: "Camille — exemple",
      code: "SPÉCIMEN",
      won: true,
      flavour: "agrumes",
      alcohol: false,
      alcohol_allowed: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (status === "expired" ? -1 : 14) * 86400000).toISOString(),
      redeemed_at: status === "used" ? new Date().toISOString() : null,
      status,
    });
  }
  const authenticated = preview || !!stats;
  return (
    <section className={styles.staff}>
      <div className={styles.staffInner}>
        <div className={styles.staffHeader}>
          <p className={styles.eyebrow}>
            <ShieldCheck size={19} aria-hidden="true" /> Le comptoir
          </p>
          <Link href="/ticket-or" className={styles.textButton}>
            Voir le jeu
          </Link>
        </div>
        <h1>
          Un bon.
          <br />
          <em>Un seul service.</em>
        </h1>
        <p className={styles.staffIntro}>
          L’espace de l’équipe pour vérifier les Tickets d’Or et enregistrer les créations offertes.
        </p>
        {preview && (
          <div className={styles.previewNotice}>
            Aperçu équipe · aucune opération réelle
            <br />
            <span>
              Les exemples ci-dessous servent uniquement à découvrir le contrôle des bons.
            </span>
          </div>
        )}
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className={styles.notice}>
            {notice}
          </p>
        )}
        {!authenticated ? (
          <form
            className={styles.staffCard}
            onSubmit={(event) => {
              event.preventDefault();
              const password = new FormData(event.currentTarget).get("password");
              if (typeof password === "string") perform(() => login(password));
            }}
          >
            <h2>Accès réservé à l’équipe</h2>
            <label className={styles.staffLabel}>
              Mot de passe équipe
              <input
                className={styles.staffInput}
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={200}
                required
              />
            </label>
            <button type="submit" className={styles.primary} disabled={busy}>
              {busy ? "Connexion…" : "Ouvrir le comptoir"}
              <LockKeyhole size={16} aria-hidden="true" />
            </button>
          </form>
        ) : (
          <>
            {stats && (
              <div className={styles.stats}>
                <div>
                  <b>{stats.participants}</b>
                  <span>Participants</span>
                </div>
                <div>
                  <b>{stats.campaign?.awarded ?? 0}</b>
                  <span>Bons gagnés</span>
                </div>
                <div>
                  <b>{stats.redeemed}</b>
                  <span>Créations servies</span>
                </div>
              </div>
            )}
            {preview ? (
              <div className={styles.staffExamples}>
                <button type="button" onClick={() => example("valid")}>
                  Exemple : bon valide
                </button>
                <button type="button" onClick={() => example("used")}>
                  Déjà utilisé
                </button>
                <button type="button" onClick={() => example("expired")}>
                  Expiré
                </button>
              </div>
            ) : (
              <form
                className={styles.staffCard}
                onSubmit={(event) => {
                  event.preventDefault();
                  setTicket(null);
                  setAdultChecked(false);
                  perform(async () => {
                    const value = await staffApi({ action: "lookup", code });
                    setTicket(value.ticket);
                  });
                }}
              >
                <label className={styles.staffLabel}>
                  Code du bon ou lien du QR code
                  <input
                    className={styles.staffInput}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="DLA-…"
                    maxLength={300}
                    autoComplete="off"
                    spellCheck={false}
                    required
                  />
                </label>
                <button type="submit" className={styles.primary} disabled={busy}>
                  {busy ? "Vérification…" : "Vérifier ce bon"}
                  <ScanLine size={19} aria-hidden="true" />
                </button>
                <p className={styles.hint}>
                  Sur téléphone, scannez le QR avec l’appareil photo habituel : son lien ouvre
                  directement ce contrôle. Vous pouvez aussi saisir le code affiché sous le QR.
                </p>
              </form>
            )}
            {ticket && (
              <div className={styles.staffCard}>
                <div className={styles.status} data-status={ticket.status} role="status">
                  {ticket.status === "valid" ? (
                    <CheckCircle2 size={25} aria-hidden="true" />
                  ) : (
                    <XCircle size={25} aria-hidden="true" />
                  )}
                  <strong>
                    {ticket.status === "valid"
                      ? "Bon valide — à servir"
                      : ticket.status === "used"
                        ? "Bon déjà utilisé — ne pas resservir"
                        : "Bon expiré — non utilisable"}
                  </strong>
                </div>
                <h2>{ticket.first_name}</h2>
                <dl className={styles.details}>
                  <div>
                    <dt>Inspiration</dt>
                    <dd>
                      {ticket.flavour === "agrumes"
                        ? "Agrumes"
                        : ticket.flavour === "herbes"
                          ? "Herbes"
                          : "Fruits"}
                    </dd>
                  </div>
                  <div>
                    <dt>Version</dt>
                    <dd>{ticket.alcohol ? "Avec alcool" : "Sans alcool"}</dd>
                  </div>
                  <div>
                    <dt>Validité</dt>
                    <dd>{ticketDate(ticket.expires_at!)}</dd>
                  </div>
                  <div>
                    <dt>Création</dt>
                    <dd>Un cocktail signature</dd>
                  </div>
                </dl>
                {ticket.status === "valid" && (
                  <>
                    <p className={styles.hint}>
                      Confirmez la version souhaitée et les éventuelles allergies avec le client
                      avant de préparer la création.
                    </p>
                    {ticket.alcohol && (
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={adultChecked}
                          onChange={(e) => setAdultChecked(e.target.checked)}
                        />
                        <span>J’ai contrôlé la preuve de majorité du client.</span>
                      </label>
                    )}
                    <button
                      type="button"
                      className={styles.primary}
                      disabled={busy || (ticket.alcohol && !adultChecked)}
                      onClick={() =>
                        perform(async () => {
                          if (preview) {
                            setTicket({
                              ...ticket,
                              status: "used",
                              redeemed_at: new Date().toISOString(),
                            });
                            setNotice(
                              "Simulation terminée : ce bon d’exemple est maintenant marqué utilisé."
                            );
                          } else {
                            const value = await staffApi({
                              action: "redeem",
                              code: ticket.code,
                              adult_checked: adultChecked,
                            });
                            setTicket(value.ticket);
                            setStats(await staffApi());
                            if (value.redeemed_now)
                              setNotice("Service confirmé. Ce bon est désormais utilisé.");
                            else
                              setError(
                                "Ce bon n’a pas été validé par cette action : il était déjà utilisé ou expiré. Ne pas servir une nouvelle création."
                              );
                          }
                        })
                      }
                    >
                      {busy
                        ? "Enregistrement…"
                        : preview
                          ? "Simuler le service"
                          : "Confirmer le service"}
                      <Check size={19} aria-hidden="true" />
                    </button>
                  </>
                )}
                {ticket.redeemed_at && (
                  <p className={styles.hint}>
                    Utilisé le {ticketDate(ticket.redeemed_at)}. Une nouvelle lecture du QR ne
                    réactive pas le bon.
                  </p>
                )}
              </div>
            )}
            {!preview && (
              <div className={styles.staffActions}>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={busy}
                  onClick={() =>
                    perform(async () => {
                      const res = await fetch("/api/ticket-or/equipe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "contacts" }),
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error);
                      }
                      const url = URL.createObjectURL(await res.blob());
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "contacts-accord-ticket-or.csv";
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    })
                  }
                >
                  <Download size={15} aria-hidden="true" /> Exporter les contacts ayant donné leur
                  accord
                </button>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={busy}
                  onClick={() =>
                    perform(async () => {
                      await staffApi({ action: "logout" });
                      setStats(null);
                      setTicket(null);
                      setCode("");
                    })
                  }
                >
                  Fermer ma session
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
