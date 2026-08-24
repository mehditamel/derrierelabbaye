// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/reservations/route";
import { reinitialiserLimites } from "@/lib/limiteDebit";

/** Demande valide de référence — date volontairement lointaine. */
const valide = {
  date: "2099-07-01",
  heure: "20:00",
  couverts: 2,
  nom: "Camille",
  telephone: "06 12 34 56 78",
  email: "camille@exemple.fr",
  message: "Terrasse si possible.",
};

let ip = 0;

/** Chaque appel part d'une IP distincte : la limite de débit ne doit pas
 *  interférer avec les cas qui ne la testent pas. */
function requete(corps: unknown, options: { ip?: string } = {}): Request {
  return new Request("http://localhost/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": options.ip ?? `10.0.0.${++ip}`,
    },
    body: typeof corps === "string" ? corps : JSON.stringify(corps),
  });
}

const envoiOk = () => new Response(JSON.stringify({ id: "re_1" }), { status: 200 });
const envoiKo = () => new Response("refusé", { status: 422 });

beforeEach(() => {
  reinitialiserLimites();
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESERVATION_MODE", "");
  vi.stubEnv("VERCEL_ENV", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/reservations — cas nominal", () => {
  it("envoie les deux e-mails et renvoie une référence", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete(valide));
    const corps = await res.json();

    expect(res.status).toBe(200);
    expect(corps.ok).toBe(true);
    expect(corps.reference).toMatch(/^DLA-[A-Z0-9]{4}$/);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Notification au bar : on doit pouvoir répondre directement au client.
    const notification = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(notification.to).toEqual(["info@derrierelabbaye.fr"]);
    expect(notification.reply_to).toBe("camille@exemple.fr");
    expect(notification.subject).toContain(corps.reference);
  });

  it("n'envoie que la notification au bar sans adresse client", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, email: "" }));

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).reply_to).toBeUndefined();
  });

  it("confirme quand même si seul l'accusé de réception échoue", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(envoiOk()) // bar : passé
      .mockResolvedValueOnce(envoiKo()); // client : échoué
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete(valide));

    // La table est réservée : c'est l'e-mail au bar qui fait foi.
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("respecte les adresses configurées par variables d'environnement", async () => {
    vi.stubEnv("RESERVATION_EMAIL_BAR", "resa@exemple.fr");
    vi.stubEnv("RESERVATION_FROM", "Bar <no-reply@exemple.fr>");
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    await POST(requete({ ...valide, email: "" }));

    const envoi = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(envoi.to).toEqual(["resa@exemple.fr"]);
    expect(envoi.from).toBe("Bar <no-reply@exemple.fr>");
  });
});

describe("POST /api/reservations — échecs honnêtes", () => {
  it("refuse sans clé API plutôt que de simuler un succès", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("RESEND_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete(valide));
    const corps = await res.json();

    expect(res.status).toBe(503);
    expect(corps.ok).toBe(false);
    expect(corps.erreur).toContain("06 44 76 91 74");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("signale l'échec quand la notification au bar ne part pas", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envoiKo()));

    const res = await POST(requete({ ...valide, email: "" }));
    const corps = await res.json();

    expect(res.status).toBe(502);
    expect(corps.ok).toBe(false);
    expect(corps.erreur).toContain("06 44 76 91 74");
  });

  it("rejette un corps illisible", async () => {
    const res = await POST(requete("pas du json"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/reservations — validation serveur", () => {
  const cas: [string, Record<string, unknown>, RegExp][] = [
    ["date malformée", { date: "01/07/2099" }, /date/i],
    ["date passée", { date: "2020-01-01" }, /passée/i],
    ["créneau hors liste", { heure: "03:00" }, /créneau/i],
    ["couverts au-delà du maximum", { couverts: 21 }, /couverts/i],
    ["couverts nuls", { couverts: 0 }, /couverts/i],
    ["couverts non entiers", { couverts: 2.5 }, /couverts/i],
    ["nom vide", { nom: "   " }, /nom/i],
    ["téléphone invalide", { telephone: "12" }, /téléphone/i],
    ["e-mail invalide", { email: "camille@exemple" }, /e-mail/i],
  ];

  it.each(cas)("refuse : %s", async (_titre, remplacement, attendu) => {
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, ...remplacement }));
    const corps = await res.json();

    expect(res.status).toBe(400);
    expect(corps.erreur).toMatch(attendu);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/reservations — le temps est celui de Marseille", () => {
  it("refuse un créneau du jour déjà écoulé", async () => {
    // 23:00 à Paris (21:00 UTC en été) : tous les créneaux du jour sont passés.
    vi.setSystemTime(new Date("2099-07-01T21:00:00Z"));
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, heure: "18:00" }));
    const corps = await res.json();

    expect(res.status).toBe(400);
    expect(corps.erreur).toMatch(/vient de passer/i);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("accepte un créneau du jour encore à venir", async () => {
    // 17:00 à Paris (15:00 UTC) : le service de 20:00 est encore ouvert.
    vi.setSystemTime(new Date("2099-07-01T15:00:00Z"));
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, email: "", heure: "20:00" }));

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("ne considère pas la veille comme aujourd'hui juste après minuit à Paris", async () => {
    // 00:30 à Paris le 2 juillet = 22:30 UTC le 1er : sur un serveur UTC, la
    // date « du jour » serait encore le 1er, et la veille passerait pour valide.
    vi.setSystemTime(new Date("2099-07-01T22:30:00Z"));
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, date: "2099-07-01" }));
    const corps = await res.json();

    expect(res.status).toBe(400);
    expect(corps.erreur).toMatch(/déjà passée/i);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("POST /api/reservations — anti-robots", () => {
  it("écarte silencieusement un envoi dont le honeypot est rempli", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, societe: "SPAM SARL" }));
    const corps = await res.json();

    // Le robot doit croire à un succès : aucun indice qu'il a été repéré.
    expect(res.status).toBe(200);
    expect(corps.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("écarte un envoi survenu trop vite après l'affichage du formulaire", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, rendu: Date.now() - 100 }));

    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("laisse passer un envoi après un délai de saisie plausible", async () => {
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete({ ...valide, rendu: Date.now() - 30_000 }));

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("limite les envois en rafale depuis un même appareil", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(envoiOk()));

    const statuts: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await POST(requete({ ...valide, email: "" }, { ip: "203.0.113.7" }));
      statuts.push(res.status);
    }

    expect(statuts.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuts[5]).toBe(429);
  });
});

describe("POST /api/reservations — mode démo", () => {
  it("court-circuite l'envoi hors production", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubEnv("RESERVATION_MODE", "demo");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await POST(requete(valide));
    const corps = await res.json();

    expect(res.status).toBe(200);
    expect(corps.reference).toMatch(/^DLA-[A-Z0-9]{4}$/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("est ignoré en production : les e-mails partent réellement", async () => {
    vi.stubEnv("RESERVATION_MODE", "demo");
    vi.stubEnv("VERCEL_ENV", "production");
    const fetchMock = vi.fn().mockResolvedValue(envoiOk());
    vi.stubGlobal("fetch", fetchMock);

    await POST(requete({ ...valide, email: "" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
