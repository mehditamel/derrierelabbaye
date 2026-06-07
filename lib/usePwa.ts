"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * État de connexion réseau (online/offline) côté client.
 * Sert à signaler une consultation hors-ligne et à désactiver les envois.
 */
export function useOnline(): boolean {
  // On part optimiste (true) pour éviter un flash hors-ligne au montage SSR.
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}

/** Événement non encore typé dans lib.dom standard. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "dla-install-dismissed";

/**
 * Capture l'invite d'installation native (`beforeinstallprompt`) pour proposer
 * un « Ajouter à l'écran d'accueil » maison. Mémorise un rejet pour ne pas harceler.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  const dismiss = useCallback(() => {
    if (typeof window !== "undefined") localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }, []);

  return { canInstall: deferred !== null && !dismissed, promptInstall, dismiss };
}
