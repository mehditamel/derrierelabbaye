import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TicketExperience } from "../TicketExperience";
import { StaffDesk } from "../StaffDesk";
import { ScratchTicket } from "../ScratchTicket";
import { TicketQr } from "../TicketQr";
import type { GameState, Ticket } from "@/lib/ticket-or/types";
vi.mock("@/components/site/MotionControl", () => ({ MotionControl: () => null }));
const fetchMock = vi.fn(),
  posts: Record<string, unknown>[] = [];
const preview: GameState = {
  mode: "preview",
  available: false,
  campaign: null,
  player: null,
  tickets: [],
  played: false,
  next_play_at: null,
};
const prize: Ticket = {
  id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
  won: true,
  code: "DLA-" + "A".repeat(24),
  flavour: "agrumes",
  alcohol: false,
  alcohol_allowed: true,
  created_at: "2026-09-13T12:00:00Z",
  expires_at: "2099-09-27T12:00:00Z",
  redeemed_at: null,
};
let state: GameState;
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  state = { ...preview };
  posts.length = 0;
  fetchMock.mockReset().mockImplementation(async (_url: string, options?: RequestInit) => {
    if (options?.method === "POST") {
      const data = JSON.parse(String(options.body));
      posts.push(data);
      if (data.action === "play") {
        state = { ...state, played: true, tickets: [prize] };
        return { ok: true, json: async () => ({ ticket: prize }) };
      }
      return { ok: true, json: async () => ({ ok: true }) };
    }
    return { ok: true, json: async () => state };
  });
  vi.stubGlobal("fetch", fetchMock);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("propose une démonstration sans coordonnées, sans requête de jeu et sans lot valable", async () => {
  render(<TicketExperience />);
  fireEvent.click(await screen.findByRole("button", { name: "Essayer le ticket" }));
  expect(screen.queryByLabelText("Téléphone mobile")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Révéler mon ticket" }));
  expect(screen.getByRole("heading", { name: "Une création. La vôtre." })).toHaveFocus();
  expect(screen.getByText("SPÉCIMEN · SANS VALEUR")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Herbes/ }));
  expect(screen.getByRole("button", { name: /Herbes/ })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Avec alcool · 18+" }));
  fireEvent.click(screen.getByRole("button", { name: "Choisir cette création" }));
  expect(await screen.findByRole("status")).toHaveTextContent(/aperçu/i);
  expect(posts).toHaveLength(0);
  expect(screen.queryByRole("link", { name: "Enregistrer le QR code" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Rejouer l’aperçu" }));
  expect(screen.getByRole("button", { name: "Essayer le ticket" })).toBeInTheDocument();
});
it("affiche une panne et permet de réessayer sans faire passer le jeu pour une démonstration", async () => {
  fetchMock.mockRejectedValueOnce(new Error("Connexion interrompue"));
  render(<TicketExperience />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Connexion interrompue");
  fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
  expect(await screen.findByRole("button", { name: "Essayer le ticket" })).toBeEnabled();
});
it("sépare les accords facultatifs, vérifie le code puis conserve le ticket dans le compte", async () => {
  state = { ...preview, mode: "live", available: true };
  render(<TicketExperience />);
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Tenter ma chance" })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole("button", { name: "Tenter ma chance" }));
  expect(screen.getByLabelText(/Recevoir les nouvelles.*e-mail/)).not.toBeChecked();
  expect(screen.getByLabelText(/Recevoir les nouvelles.*SMS/)).not.toBeChecked();
  fireEvent.change(screen.getByLabelText("Prénom"), { target: { value: "Camille" } });
  fireEvent.change(screen.getByLabelText("Téléphone mobile"), { target: { value: "0600000000" } });
  fireEvent.click(screen.getByLabelText(/Je certifie/));
  fireEvent.click(screen.getByLabelText(/J’accepte/));
  fireEvent.submit(screen.getByRole("button", { name: "Recevoir mon code" }).closest("form")!);
  await screen.findByLabelText("Code de vérification");
  expect(posts[0]).toMatchObject({
    action: "send-code",
    adult: true,
    rules: true,
    email_opt_in: false,
    sms_opt_in: false,
  });
  state = {
    ...state,
    player: {
      first_name: "Camille",
      last_name: "",
      phone: "+33600000000",
      email: "",
      email_opt_in: false,
      sms_opt_in: false,
    },
  };
  fireEvent.change(screen.getByLabelText("Code de vérification"), { target: { value: "123456" } });
  fireEvent.submit(screen.getByRole("button", { name: "Entrer dans le jeu" }).closest("form")!);
  fireEvent.click(await screen.findByRole("button", { name: "Découvrir mon ticket" }));
  fireEvent.click(await screen.findByRole("button", { name: "Révéler mon ticket" }));
  expect(screen.getByRole("link", { name: "Enregistrer le QR code" })).toHaveAttribute(
    "download",
    "mon-bon-abbaye.svg"
  );
  fireEvent.click(screen.getByRole("button", { name: /Fruits/ }));
  fireEvent.click(screen.getByRole("button", { name: "Choisir cette création" }));
  await waitFor(() =>
    expect(posts.at(-1)).toMatchObject({ action: "choice", flavour: "fruits", alcohol: false })
  );
  fireEvent.click(screen.getByRole("button", { name: "Retour à mes tickets" }));
  expect(
    screen.getByRole("button", { name: "Votre ticket de la semaine est joué" })
  ).toBeDisabled();
  fireEvent.click(screen.getByText("Mes préférences et ma connexion"));
  expect(screen.getByLabelText("Nouvelles par e-mail")).toBeDisabled();
  fireEvent.click(screen.getByLabelText("Nouvelles par SMS"));
  fireEvent.click(screen.getByRole("button", { name: "Enregistrer mes préférences" }));
  await waitFor(() => expect(posts.at(-1)).toMatchObject({ action: "consent", sms_opt_in: true }));
  fireEvent.click(screen.getByRole("button", { name: /Votre cocktail signature/ }));
  expect(screen.getByRole("heading", { name: "Une création. La vôtre." })).toBeInTheDocument();
});
it("n’invente pas de lot pour un ticket perdant et conserve les bons expirés consultables", async () => {
  state = {
    ...preview,
    mode: "live",
    player: {
      first_name: "Test",
      last_name: "",
      phone: "+33600000000",
      email: "",
      sms_opt_in: false,
      email_opt_in: false,
    },
    played: true,
    tickets: [{ ...prize, won: false, code: null, expires_at: null }],
  };
  const view = render(<TicketExperience />);
  fireEvent.click(await screen.findByRole("button", { name: /Votre participation/ }));
  expect(
    screen.getByRole("heading", { name: "Pas cette fois. À très bientôt." })
  ).toBeInTheDocument();
  expect(screen.queryByRole("img", { name: /QR code/ })).not.toBeInTheDocument();
  view.unmount();
  state = { ...state, tickets: [{ ...prize, expires_at: "2020-01-01T00:00:00Z" }] };
  render(<TicketExperience />);
  fireEvent.click(await screen.findByRole("button", { name: /Votre cocktail signature/ }));
  expect(screen.getByText("La date de validité de ce bon est dépassée.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Choisir cette création" })).not.toBeInTheDocument();
});
it("montre au personnel la différence entre un bon valide, utilisé et expiré", async () => {
  render(<StaffDesk preview />);
  fireEvent.click(screen.getByRole("button", { name: "Exemple : bon valide" }));
  expect(screen.getByText("Bon valide — à servir")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Simuler le service" }));
  expect(await screen.findByText("Bon déjà utilisé — ne pas resservir")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Simuler le service" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Expiré" }));
  expect(screen.getByText("Bon expiré — non utilisable")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Déjà utilisé" }));
  expect(screen.getByText("Bon déjà utilisé — ne pas resservir")).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});
it("exige le contrôle de majorité et traite un bon déjà servi pendant la validation", async () => {
  fetchMock.mockImplementation(async (_url: string, options?: RequestInit) => {
    const data = options?.body ? JSON.parse(String(options.body)) : null;
    if (data) posts.push(data);
    if (data?.action === "lookup")
      return {
        ok: true,
        json: async () => ({
          ticket: { ...prize, alcohol: true, first_name: "Test", status: "valid" },
        }),
      };
    if (data?.action === "redeem")
      return {
        ok: true,
        json: async () => ({
          redeemed_now: false,
          ticket: {
            ...prize,
            alcohol: true,
            first_name: "Test",
            status: "used",
            redeemed_at: new Date().toISOString(),
          },
        }),
      };
    return { ok: true, json: async () => ({ campaign: null, participants: 1, redeemed: 1 }) };
  });
  render(<StaffDesk preview={false} />);
  fireEvent.change(await screen.findByLabelText("Code du bon ou lien du QR code"), {
    target: { value: prize.code },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Vérifier ce bon" }).closest("form")!);
  const serve = await screen.findByRole("button", { name: "Confirmer le service" });
  expect(serve).toBeDisabled();
  fireEvent.click(screen.getByLabelText(/J’ai contrôlé/));
  expect(serve).toBeEnabled();
  fireEvent.click(serve);
  expect(await screen.findByRole("alert")).toHaveTextContent(/déjà utilisé ou expiré/);
  expect(posts.at(-1)).toMatchObject({ action: "redeem", adult_checked: true });
  fireEvent.click(screen.getByRole("button", { name: "Fermer ma session" }));
  expect(await screen.findByLabelText("Mot de passe équipe")).toBeInTheDocument();
});
it("permet le contrôle au comptoir après connexion et affiche les refus", async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Session expirée" }) });
  render(<StaffDesk preview={false} />);
  fireEvent.change(screen.getByLabelText("Mot de passe équipe"), {
    target: { value: "test-only" },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Ouvrir le comptoir" }).closest("form")!);
  await screen.findByLabelText("Code du bon ou lien du QR code");
  fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Bon introuvable" }) });
  fireEvent.change(screen.getByLabelText("Code du bon ou lien du QR code"), {
    target: { value: "DLA-inconnu" },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Vérifier ce bon" }).closest("form")!);
  expect(await screen.findByRole("alert")).toHaveTextContent("Bon introuvable");
});
it("révèle au grattage et au clavier une seule fois", () => {
  const ctx = {
    setTransform: vi.fn(),
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
  };
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  );
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 300,
    bottom: 240,
    width: 300,
    height: 240,
    toJSON: () => ({}),
  });
  HTMLCanvasElement.prototype.setPointerCapture = vi.fn();
  HTMLCanvasElement.prototype.releasePointerCapture = vi.fn();
  HTMLCanvasElement.prototype.hasPointerCapture = () => true;
  const reveal = vi.fn(),
    view = render(<ScratchTicket onReveal={reveal} />),
    canvas = view.container.querySelector("canvas")!;
  fireEvent.pointerDown(canvas, { clientX: 0, clientY: 20 });
  for (let y = 20; y < 240; y += 30) {
    fireEvent.pointerMove(canvas, { clientX: 300, clientY: y });
    fireEvent.pointerMove(canvas, { clientX: 0, clientY: y + 15 });
  }
  fireEvent.pointerUp(canvas);
  fireEvent.pointerCancel(canvas);
  fireEvent.click(screen.getByRole("button", { name: "Révéler mon ticket" }));
  expect(reveal).toHaveBeenCalledOnce();
});
it("produit un QR local téléchargeable uniquement pour un vrai bon", () => {
  const view = render(<TicketQr code={prize.code!} />);
  expect(screen.getByRole("link", { name: "Enregistrer le QR code" })).toHaveAttribute(
    "href",
    expect.stringContaining("data:image/svg+xml")
  );
  view.rerender(<TicketQr code="demo" preview />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(
    screen.getByRole("img", { name: "QR code de démonstration, sans valeur" })
  ).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
});
