// @vitest-environment node
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

function worker() {
  const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
  const cache = {
    put: vi.fn().mockResolvedValue(undefined),
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
  };
  const caches = {
    open: vi.fn().mockResolvedValue(cache),
    match: vi.fn().mockResolvedValue(undefined),
    keys: vi
      .fn()
      .mockResolvedValue(["another-app", "dla-shell-v5", "dla-shell-v6", "dla-runtime-v1"]),
    delete: vi.fn().mockResolvedValue(true),
  };
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response("page", { headers: { "Content-Type": "text/html" } }));
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    self: {
      location: { origin: "https://www.derrierelabbaye.fr" },
      addEventListener: (type: string, fn: (typeof listeners)[string]) => {
        listeners[type] = fn;
      },
      clients: { claim: vi.fn() },
    },
    caches,
    fetch,
    URL,
    Response,
    console,
  });
  function request(path: string, mode = "cors") {
    const event = {
      request: { method: "GET", mode, url: new URL(path, "https://www.derrierelabbaye.fr").href },
      respondWith: vi.fn(),
      waitUntil: vi.fn(),
    };
    listeners.fetch(event);
    return event;
  }
  return { request, cache, caches, fetch, listeners };
}

describe("service worker", () => {
  it.each([
    "/api/reservations",
    "/ticket-or",
    "/ticket-or/equipe",
    "/api/ticket-or",
    "/app/carte?_rsc=123",
    "https://www.google.com/maps",
  ])("laisse passer sans cache : %s", (url) => {
    expect(worker().request(url).respondWith).not.toHaveBeenCalled();
  });
  it("actualise la copie HTML après une navigation réussie", async () => {
    const w = worker();
    const event = w.request("/app/carte", "navigate");
    await event.respondWith.mock.calls[0][0];
    await event.waitUntil.mock.calls[0][0];
    expect(w.cache.put).toHaveBeenCalledOnce();
  });
  it("conserve le travail de mise à jour même quand un asset est déjà en cache", async () => {
    const w = worker();
    const ancien = new Response("ancien");
    w.caches.match.mockResolvedValue(ancien as never);
    const event = w.request("/_next/static/chunk.js");
    expect(await event.respondWith.mock.calls[0][0]).toBe(ancien);
    await event.waitUntil.mock.calls[0][0];
    expect(w.cache.put).toHaveBeenCalledOnce();
  });
  it("ne supprime pas les caches d'une autre application", async () => {
    const w = worker();
    const event = { waitUntil: vi.fn() };
    w.listeners.activate(event);
    await event.waitUntil.mock.calls[0][0];
    expect(w.caches.delete.mock.calls).toEqual([["dla-shell-v5"], ["dla-shell-v6"]]);
  });
});
