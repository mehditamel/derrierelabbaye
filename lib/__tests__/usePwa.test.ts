import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useInstallPrompt, useOnline } from "@/lib/usePwa";

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value });
}

describe("useOnline", () => {
  afterEach(() => setOnline(true));

  it("réagit aux événements online / offline", () => {
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(true);

    setOnline(false);
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current).toBe(false);

    setOnline(true);
    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current).toBe(true);
  });
});

describe("useInstallPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom ne fournit pas matchMedia : on simule « pas en mode standalone ».
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;
  });

  it("expose canInstall après beforeinstallprompt, puis dismiss le mémorise", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);

    const e = new Event("beforeinstallprompt") as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    e.prompt = vi.fn().mockResolvedValue(undefined);
    e.userChoice = Promise.resolve({ outcome: "accepted" });

    act(() => window.dispatchEvent(e));
    expect(result.current.canInstall).toBe(true);

    act(() => result.current.dismiss());
    expect(result.current.canInstall).toBe(false);
    expect(localStorage.getItem("dla-install-dismissed")).toBe("1");
  });
});
