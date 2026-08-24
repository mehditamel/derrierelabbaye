import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useLocalStorage } from "@/lib/useLocalStorage";

afterEach(() => localStorage.clear());

describe("useLocalStorage", () => {
  it("rend la valeur initiale puis passe ready à true", async () => {
    const { result } = renderHook(() => useLocalStorage("dla-test", { nom: "" }));
    expect(result.current.value).toEqual({ nom: "" });
    await waitFor(() => expect(result.current.ready).toBe(true));
  });

  it("lit une valeur déjà présente au montage", async () => {
    localStorage.setItem("dla-test", JSON.stringify({ nom: "Camille" }));
    const { result } = renderHook(() => useLocalStorage("dla-test", { nom: "" }));
    await waitFor(() => expect(result.current.value).toEqual({ nom: "Camille" }));
  });

  it("persiste la valeur écrite dans localStorage", async () => {
    const { result } = renderHook(() => useLocalStorage("dla-test", { nom: "" }));
    act(() => result.current.set({ nom: "Sofia" }));
    expect(result.current.value).toEqual({ nom: "Sofia" });
    expect(JSON.parse(localStorage.getItem("dla-test")!)).toEqual({
      nom: "Sofia",
    });
  });

  it("accepte une mise à jour fonctionnelle", () => {
    const { result } = renderHook(() => useLocalStorage("dla-compteur", 0));
    act(() => result.current.set((n) => n + 1));
    expect(result.current.value).toBe(1);
  });

  it("remove efface la clé et restaure la valeur initiale", async () => {
    const { result } = renderHook(() => useLocalStorage("dla-test", { nom: "init" }));
    act(() => result.current.set({ nom: "Sofia" }));
    act(() => result.current.remove());
    expect(result.current.value).toEqual({ nom: "init" });
    expect(localStorage.getItem("dla-test")).toBeNull();
  });

  it("ignore une valeur stockée corrompue sans planter", async () => {
    localStorage.setItem("dla-test", "{pas du json");
    const { result } = renderHook(() => useLocalStorage("dla-test", { nom: "repli" }));
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.value).toEqual({ nom: "repli" });
  });
});

describe("useLocalStorage — garde de forme", () => {
  it("ignore et purge une valeur bien formée mais de mauvaise structure", () => {
    const estContact = (v: unknown): v is { nom: string } =>
      typeof v === "object" && v !== null && typeof (v as { nom?: unknown }).nom === "string";

    // JSON syntaxiquement valide, structurellement faux : le cas que le
    // try/catch ne rattrapait pas.
    localStorage.setItem("cle-forme", JSON.stringify({ nom: 42 }));

    const { result } = renderHook(() =>
      useLocalStorage("cle-forme", { nom: "défaut" }, estContact)
    );

    expect(result.current.value).toEqual({ nom: "défaut" });
    // La valeur fautive est retirée, sans quoi elle serait relue à chaque montage.
    expect(localStorage.getItem("cle-forme")).toBeNull();
  });

  it("accepte une valeur conforme", () => {
    const estContact = (v: unknown): v is { nom: string } =>
      typeof v === "object" && v !== null && typeof (v as { nom?: unknown }).nom === "string";
    localStorage.setItem("cle-ok", JSON.stringify({ nom: "Camille" }));

    const { result } = renderHook(() => useLocalStorage("cle-ok", { nom: "défaut" }, estContact));

    expect(result.current.value).toEqual({ nom: "Camille" });
    expect(localStorage.getItem("cle-ok")).not.toBeNull();
  });

  it("sans garde, se comporte comme avant", () => {
    localStorage.setItem("cle-libre", JSON.stringify({ nom: 42 }));
    const { result } = renderHook(() => useLocalStorage("cle-libre", { nom: "défaut" }));
    expect(result.current.value).toEqual({ nom: 42 });
  });
});
