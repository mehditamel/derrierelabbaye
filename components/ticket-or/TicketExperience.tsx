"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Citrus,
  Clock3,
  Gift,
  Leaf,
  LockKeyhole,
  Phone,
  Sparkles,
  Ticket,
  Wine,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { MotionControl } from "@/components/site/MotionControl";
import { site } from "@/data/site";
import {
  type GameState,
  type Ticket as PrizeTicket,
  type Flavour,
  ticketDate,
} from "@/lib/ticket-or/types";
import { ScratchTicket } from "./ScratchTicket";
import { TicketQr } from "./TicketQr";
import styles from "./TicketOr.module.css";

type Phase = "intro" | "register" | "code" | "scratch" | "result";
const FLAVOURS: { id: Flavour; name: string; note: string; icon: typeof Citrus }[] = [
  { id: "agrumes", name: "Agrumes", note: "Vif & frais", icon: Citrus },
  { id: "fruits", name: "Fruits", note: "Rond & gourmand", icon: Gift },
  { id: "herbes", name: "Herbes", note: "Végétal & parfumé", icon: Leaf },
];

async function api(data?: Record<string, unknown>) {
  const res = await fetch(
    "/api/ticket-or",
    data
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      : { cache: "no-store" }
  );
  const value = await res.json();
  if (!res.ok) throw new Error(value.error || "Le service est momentanément indisponible.");
  return value;
}

export function TicketExperience() {
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ticket, setTicket] = useState<PrizeTicket | null>(null);
  const [flavour, setFlavour] = useState<Flavour>("agrumes");
  const [alcohol, setAlcohol] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const resultTitle = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const preview = state?.mode === "preview";

  async function refresh() {
    const value: GameState = await api();
    setState(value);
    if (value.player) {
      setEmailOptIn(value.player.email_opt_in);
      setSmsOptIn(value.player.sms_opt_in);
    }
    return value;
  }
  useEffect(() => {
    let active = true;
    api()
      .then((value) => {
        if (active) {
          setState(value);
          setEmailOptIn(value.player?.email_opt_in ?? false);
          setSmsOptIn(value.player?.sms_opt_in ?? false);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (phase === "result") resultTitle.current?.focus();
  }, [phase]);

  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setBusy(false);
    }
  }
  function openTicket(value: PrizeTicket) {
    setTicket(value);
    setFlavour(value.flavour);
    setAlcohol(value.alcohol);
    setPhase("result");
  }
  function moveTo(next: Phase) {
    setError("");
    setPhase(next);
    panel.current?.scrollIntoView({
      block: "center",
      behavior: document.documentElement.dataset.motion === "paused" ? "instant" : "smooth",
    });
  }
  async function start() {
    if (preview) {
      setTicket({
        id: "demo",
        won: true,
        code: "DEMONSTRATION",
        flavour: "agrumes",
        alcohol: false,
        alcohol_allowed: true,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        redeemed_at: null,
      });
      setFlavour("agrumes");
      setAlcohol(false);
      moveTo("scratch");
      return;
    }
    if (!state?.player) {
      moveTo("register");
      return;
    }
    await perform(async () => {
      const { ticket: value } = await api({ action: "play" });
      setTicket(value);
      setFlavour(value.flavour);
      setAlcohol(value.alcohol);
      await refresh();
      moveTo("scratch");
    });
  }
  const validTicket =
    ticket?.won &&
    !ticket.redeemed_at &&
    !!ticket.expires_at &&
    new Date(ticket.expires_at) > new Date();
  const alcoholAllowed = preview || ticket?.alcohol_allowed;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.halo} aria-hidden="true" />
        <div className={`u-container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.star}>✦</span> Une attention de la maison
            </p>
            <h1 className={styles.heroTitle}>
              Le Ticket
              <br />
              <em>d’Or.</em>
            </h1>
            <p className={styles.heroIntro}>
              Un peu de mystère.
              <br />
              Une création à votre goût.
            </p>
            <p className={styles.heroText}>
              Derrière la surface dorée, une surprise se dessine. Découvrez le rituel de l’Abbaye et
              imaginez votre cocktail signature.
            </p>
            <div className={styles.meta}>
              <span>
                <Ticket size={15} aria-hidden="true" /> Jeu gratuit
              </span>
              <span>18 ans et plus</span>
              <span>Saint-Victor, Marseille</span>
            </div>
            <div className={styles.heroBottom}>
              <Link href="#mon-ticket">
                Découvrir le ticket <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <MotionControl />
            </div>
          </div>
          <div id="mon-ticket" ref={panel} className={styles.gameColumn}>
            <div className={styles.gamePanel} aria-busy={busy}>
              <div className={styles.panelTop}>
                <Logo tone="cream" width={122} />
                <span className={styles.edition}>
                  Édition
                  <br />
                  <b>Saint-Victor</b>
                </span>
              </div>
              {preview && (
                <div className={styles.previewNotice}>
                  Avant-première · essai libre
                  <br />
                  <span>
                    Le jeu n’est pas encore ouvert. Aucun lot réel ni donnée collectée dans cet
                    aperçu.
                  </span>
                </div>
              )}
              {error && (
                <div role="alert" className={styles.error}>
                  {error}
                  {!state && (
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() =>
                        perform(async () => {
                          await refresh();
                        })
                      }
                    >
                      Réessayer
                    </button>
                  )}
                </div>
              )}
              {message && (
                <p className={styles.notice} role="status">
                  {message}
                </p>
              )}

              {phase === "intro" && (
                <div className={styles.introPanel}>
                  <div className={styles.paperTicket} aria-hidden="true">
                    <div className={styles.ticketFrame}>
                      <span className={styles.serial}>DLA / 07 — MARSEILLE</span>
                      <div className={styles.ticketSeal}>
                        <Sparkles size={23} strokeWidth={1} />
                        <span>Ticket</span>
                        <em>d’Or</em>
                        <small>DE L’ABBAYE</small>
                      </div>
                      <div className={styles.ticketStub}>
                        <span>
                          UNE CRÉATION
                          <br />À VOTRE GOÛT
                        </span>
                        <span>◆</span>
                        <b>À GRATTER</b>
                      </div>
                    </div>
                  </div>
                  <h2>
                    {state?.player
                      ? `À vous de jouer, ${state.player.first_name}.`
                      : "La surprise commence ici."}
                  </h2>
                  <p>
                    {preview
                      ? "Laissez votre doigt découvrir ce qui se cache sous l’or."
                      : state?.available
                        ? "Une participation gratuite par semaine. Un cocktail signature à remporter, dans la limite des lots annoncés."
                        : state
                          ? "Les participations ne sont pas ouvertes pour le moment. Retrouvez ici vos bons déjà gagnés."
                          : "Votre ticket se prépare…"}
                  </p>
                  <button
                    className={styles.primary}
                    type="button"
                    disabled={busy || !state || (!preview && (!state.available || state.played))}
                    onClick={start}
                  >
                    {busy
                      ? "Un instant…"
                      : preview
                        ? "Essayer le ticket"
                        : state?.played
                          ? "Votre ticket de la semaine est joué"
                          : state?.player
                            ? "Découvrir mon ticket"
                            : "Tenter ma chance"}
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </button>
                  {state?.played && state.next_play_at && (
                    <p className={styles.hint}>
                      Prochaine participation à partir du {ticketDate(state.next_play_at)}.
                    </p>
                  )}
                  {!preview && state && !state.player && (
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => moveTo("register")}
                    >
                      Retrouver mes bons
                    </button>
                  )}
                  <p className={styles.smallPrint}>
                    {preview
                      ? "Sans inscription · à essayer au doigt ou au clavier"
                      : "Sans obligation d’achat · "}
                    <Link href="/ticket-or/reglement">
                      {preview ? "Le fonctionnement" : "Règlement et lots"}
                    </Link>
                  </p>
                </div>
              )}

              {phase === "register" && (
                <form
                  className={styles.form}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const values = new FormData(event.currentTarget);
                    perform(async () => {
                      await api({
                        action: "send-code",
                        first_name: values.get("first_name"),
                        last_name: values.get("last_name") || "",
                        phone: values.get("phone"),
                        email: values.get("email") || "",
                        email_opt_in: values.get("email_opt_in") === "on",
                        sms_opt_in: values.get("sms_opt_in") === "on",
                        adult: values.get("adult") === "on",
                        rules: values.get("rules") === "on",
                        website: values.get("website") || "",
                      });
                      setPhase("code");
                    });
                  }}
                >
                  <button type="button" className={styles.back} onClick={() => moveTo("intro")}>
                    <ChevronLeft size={16} aria-hidden="true" /> Retour
                  </button>
                  <p className={styles.eyebrow}>01 / Votre entrée dans le jeu</p>
                  <h2>Faisons connaissance.</h2>
                  <p>
                    Un code par SMS protège votre participation et vous permet de retrouver vos
                    bons.
                  </p>
                  <label>
                    Prénom
                    <input name="first_name" autoComplete="given-name" maxLength={60} required />
                  </label>
                  <label>
                    Téléphone mobile
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="06 ou 07…"
                      maxLength={30}
                      required
                    />
                  </label>
                  <p className={styles.hint}>
                    Mobiles français uniquement pour cette première édition.
                  </p>
                  <details className={styles.optional}>
                    <summary>
                      Ajouter mon nom et mon e-mail <span>facultatif</span>
                    </summary>
                    <label>
                      Nom
                      <input name="last_name" autoComplete="family-name" maxLength={60} />
                    </label>
                    <label>
                      E-mail
                      <input name="email" type="email" autoComplete="email" maxLength={254} />
                    </label>
                  </details>
                  <div className={styles.honeypot} aria-hidden="true">
                    <label>
                      Votre site
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                  <label className={styles.checkbox}>
                    <input type="checkbox" name="adult" required />
                    <span>Je certifie avoir au moins 18 ans.</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" name="rules" required />
                    <span>
                      J’accepte le{" "}
                      <Link href="/ticket-or/reglement" target="_blank">
                        règlement du jeu
                      </Link>
                      .
                    </span>
                  </label>
                  <div className={styles.consentBox}>
                    <p>Gardons le lien, si vous le souhaitez.</p>
                    <label className={styles.checkbox}>
                      <input type="checkbox" name="email_opt_in" />
                      <span>Recevoir les nouvelles de l’Abbaye par e-mail.</span>
                    </label>
                    <label className={styles.checkbox}>
                      <input type="checkbox" name="sms_opt_in" />
                      <span>Recevoir les nouvelles de l’Abbaye par SMS.</span>
                    </label>
                    <small>Facultatif. Votre choix ne change pas vos chances de gagner.</small>
                  </div>
                  <button type="submit" className={styles.primary} disabled={busy}>
                    {busy ? "Envoi en cours…" : "Recevoir mon code"}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                  <p className={styles.smallPrint}>
                    <LockKeyhole size={12} aria-hidden="true" /> Vos informations servent à gérer le
                    jeu et vos bons.{" "}
                    <Link href="/ticket-or/reglement#vos-donnees">Vos données et vos droits</Link>
                  </p>
                </form>
              )}

              {phase === "code" && (
                <form
                  className={styles.form}
                  onSubmit={(event) => {
                    event.preventDefault();
                    const code = new FormData(event.currentTarget).get("code");
                    perform(async () => {
                      await api({ action: "verify-code", code });
                      await refresh();
                      moveTo("intro");
                    });
                  }}
                >
                  <p className={styles.eyebrow}>02 / Juste entre nous</p>
                  <h2>Le code est en route.</h2>
                  <p>Saisissez les six chiffres reçus par SMS. Ils sont valables dix minutes.</p>
                  <label>
                    Code de vérification
                    <input
                      className={styles.otp}
                      name="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="· · · · · ·"
                      required
                    />
                  </label>
                  <button type="submit" className={styles.primary} disabled={busy}>
                    {busy ? "Vérification…" : "Entrer dans le jeu"}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={busy}
                    onClick={() => setPhase("register")}
                  >
                    Modifier mon numéro ou demander un nouveau code
                  </button>
                </form>
              )}

              {phase === "scratch" && (
                <div className={styles.scratchPanel}>
                  <p className={styles.eyebrow}>Le moment de vérité</p>
                  <h2>À fleur d’or.</h2>
                  <ScratchTicket onReveal={() => setPhase("result")} />
                </div>
              )}

              {phase === "result" && ticket && (
                <div className={styles.result}>
                  <div className={styles.resultSpark} aria-hidden="true">
                    <Sparkles size={28} strokeWidth={1} />
                  </div>
                  <p className={styles.eyebrow}>
                    {preview
                      ? "Un aperçu de la surprise"
                      : ticket.won
                        ? "Votre Ticket d’Or"
                        : "Le rendez-vous continue"}
                  </p>
                  <h2 ref={resultTitle} tabIndex={-1}>
                    {ticket.won ? (
                      <>
                        Une création.
                        <br />
                        <em>La vôtre.</em>
                      </>
                    ) : (
                      <>
                        Pas cette fois.
                        <br />
                        <em>À très bientôt.</em>
                      </>
                    )}
                  </h2>
                  {!ticket.won ? (
                    <>
                      <p>
                        Ce ticket n’est pas gagnant.
                        {state?.next_play_at
                          ? ` Une nouvelle participation vous attend à partir du ${ticketDate(state.next_play_at)}.`
                          : " Cette édition se termine bientôt. Merci d’avoir participé."}
                      </p>
                      <Link href="/carte" className={styles.primary}>
                        Découvrir la carte <ArrowUpRight size={18} aria-hidden="true" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <p>
                        {preview
                          ? "Voici votre bon de démonstration. Imaginez maintenant sa saveur."
                          : ticket.redeemed_at
                            ? "Ce bon a déjà été utilisé. Nous espérons que la création vous a plu."
                            : !validTicket
                              ? "La date de validité de ce bon est dépassée."
                              : "Votre cocktail signature est offert. Choisissez votre inspiration, puis présentez ce bon à l’équipe."}
                      </p>
                      {(validTicket || preview) && (
                        <div className={styles.customize}>
                          <fieldset>
                            <legend>Votre inspiration</legend>
                            <div className={styles.flavours}>
                              {FLAVOURS.map(({ id, name, note, icon: Icon }) => (
                                <button
                                  key={id}
                                  type="button"
                                  aria-pressed={flavour === id}
                                  onClick={() => setFlavour(id)}
                                >
                                  <Icon size={22} strokeWidth={1} aria-hidden="true" />
                                  <b>{name}</b>
                                  <span>{note}</span>
                                </button>
                              ))}
                            </div>
                          </fieldset>
                          <fieldset className={styles.alcoholChoice}>
                            <legend>Votre version</legend>
                            <button
                              type="button"
                              aria-pressed={!alcohol}
                              onClick={() => setAlcohol(false)}
                            >
                              Sans alcool
                            </button>
                            {alcoholAllowed && (
                              <button
                                type="button"
                                aria-pressed={alcohol}
                                onClick={() => setAlcohol(true)}
                              >
                                Avec alcool · 18+
                              </button>
                            )}
                          </fieldset>
                          <button
                            className={styles.primary}
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              perform(async () => {
                                if (!preview) {
                                  await api({ action: "choice", id: ticket.id, flavour, alcohol });
                                  const fresh = await refresh();
                                  const saved = fresh.tickets.find((t) => t.id === ticket.id);
                                  if (saved) setTicket(saved);
                                }
                                setMessage(
                                  preview
                                    ? "Votre inspiration est choisie pour cet aperçu."
                                    : "Votre inspiration est enregistrée. Présentez votre bon à l’équipe."
                                );
                              })
                            }
                          >
                            {busy ? "Enregistrement…" : "Choisir cette création"}
                            <Check size={18} aria-hidden="true" />
                          </button>
                          <p className={styles.hint}>
                            La création est adaptée par le barman aux ingrédients disponibles.
                            Signalez vos allergies directement à l’équipe.
                          </p>
                        </div>
                      )}
                      <div className={`${styles.coupon} ${preview ? styles.specimen : ""}`}>
                        <div className={styles.couponHead}>
                          <span>
                            {preview ? "BON DE DÉMONSTRATION" : "UN COCKTAIL SIGNATURE OFFERT"}
                          </span>
                          <Wine size={22} strokeWidth={1} aria-hidden="true" />
                        </div>
                        <TicketQr code={ticket.code!} preview={preview} />
                        <p>
                          {preview
                            ? "Cet exemple ne peut pas être échangé au bar."
                            : ticket.redeemed_at
                              ? `Utilisé le ${ticketDate(ticket.redeemed_at)}`
                              : `À utiliser avant le ${ticketDate(ticket.expires_at!)} · une seule fois`}
                        </p>
                      </div>
                      {!preview && (
                        <a
                          className={styles.textButton}
                          href={site.adresse.directionsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Venir à l’Abbaye <ArrowUpRight size={17} aria-hidden="true" />
                        </a>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => moveTo("intro")}
                  >
                    {preview ? "Rejouer l’aperçu" : "Retour à mes tickets"}
                  </button>
                </div>
              )}
              <div className={styles.panelBottom}>
                <span>SAINT-VICTOR</span>
                <span>◆</span>
                <span>MARSEILLE 7e</span>
              </div>
            </div>
            {!preview && state?.player && phase === "intro" && (
              <div className={styles.wallet}>
                <h2>Vos tickets</h2>
                {state.tickets.length ? (
                  state.tickets.map((t) => (
                    <button type="button" key={t.id} onClick={() => openTicket(t)}>
                      <Ticket size={20} aria-hidden="true" />
                      <span>
                        {t.won
                          ? t.redeemed_at
                            ? "Votre création a été servie"
                            : "Votre cocktail signature"
                          : "Votre participation"}
                        <small>{ticketDate(t.created_at)}</small>
                      </span>
                      <ArrowUpRight size={19} aria-hidden="true" />
                    </button>
                  ))
                ) : (
                  <p>Votre premier ticket vous attend.</p>
                )}
                <details className={styles.preferences}>
                  <summary>Mes préférences et ma connexion</summary>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={emailOptIn}
                      disabled={!state.player.email}
                      onChange={(e) => setEmailOptIn(e.target.checked)}
                    />
                    <span>Nouvelles par e-mail</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={smsOptIn}
                      onChange={(e) => setSmsOptIn(e.target.checked)}
                    />
                    <span>Nouvelles par SMS</span>
                  </label>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={busy}
                    onClick={() =>
                      perform(async () => {
                        await api({
                          action: "consent",
                          email_opt_in: emailOptIn,
                          sms_opt_in: smsOptIn,
                        });
                        await refresh();
                        setMessage("Vos préférences sont enregistrées.");
                      })
                    }
                  >
                    Enregistrer mes préférences
                  </button>
                  <button
                    type="button"
                    className={styles.textButton}
                    disabled={busy}
                    onClick={() =>
                      perform(async () => {
                        await api({ action: "logout" });
                        await refresh();
                        setTicket(null);
                      })
                    }
                  >
                    Me déconnecter
                  </button>
                </details>
              </div>
            )}
            <p className={styles.underPanel}>
              <LockKeyhole size={13} aria-hidden="true" />{" "}
              {preview
                ? "Un avant-goût de ce qui se prépare à Saint-Victor."
                : "Un bon personnel. Une seule utilisation. Tout simplement."}
            </p>
          </div>
        </div>
      </section>
      <section className={styles.ritual} id="le-rituel">
        <div className="u-container">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Le rituel</p>
              <h2>
                Trois gestes.
                <br />
                <em>Une attention.</em>
              </h2>
            </div>
            <p>
              Du premier clic au comptoir,
              <br />
              la maison s’occupe du reste.
            </p>
          </div>
          <div className={styles.steps}>
            {[
              {
                icon: Phone,
                n: "01",
                title: "Entrez dans le jeu.",
                text: "Une inscription rapide, un téléphone vérifié. La participation est gratuite et les nouvelles du bar restent à votre choix.",
              },
              {
                icon: Sparkles,
                n: "02",
                title: "Laissez l’or parler.",
                text: "Grattez votre ticket. Le résultat est instantané et votre participation est conservée pour la semaine.",
              },
              {
                icon: Wine,
                n: "03",
                title: "Composez votre création.",
                text: "Si vous gagnez, choisissez votre inspiration et présentez le bon à l’équipe. La version sans alcool est toujours proposée.",
              },
            ].map(({ icon: Icon, n, title, text }) => (
              <article key={n}>
                <div>
                  <span>{n}</span>
                  <Icon size={28} strokeWidth={1} aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className={styles.ritualFoot}>
            <Clock3 size={17} aria-hidden="true" />
            <p>
              Une participation par semaine et par numéro vérifié. Bons valables 14 jours.
              Conditions et dates précisées à l’ouverture du jeu.
            </p>
            <Link href="/ticket-or/reglement">
              Lire le fonctionnement <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
