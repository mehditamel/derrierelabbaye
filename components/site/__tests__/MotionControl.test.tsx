import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MotionControl, MotionProvider } from "../MotionControl";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function preference(matches = false) {
  const media = { matches, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal("matchMedia", () => media);
  return media;
}

it("partage le choix de pause entre les sections et le conserve après une navigation", () => {
  preference();
  const page = (second: boolean) => (
    <MotionProvider>
      <MotionControl />
      {second && <MotionControl />}
    </MotionProvider>
  );
  const view = render(page(true));
  fireEvent.click(screen.getAllByRole("button", { name: "Mettre les animations en pause" })[0]);
  expect(screen.getAllByRole("button", { name: "Reprendre les animations" })).toHaveLength(2);
  expect(document.documentElement.dataset.motion).toBe("paused");
  view.rerender(page(false));
  expect(screen.getByRole("button", { name: "Reprendre les animations" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  fireEvent.click(screen.getByRole("button"));
  expect(document.documentElement.dataset.motion).toBe("playing");
});

it("respecte une préférence système réduite et ses changements, puis nettoie le réglage", () => {
  const media = preference(true);
  const view = render(
    <MotionProvider>
      <MotionControl />
    </MotionProvider>
  );
  expect(document.documentElement.dataset.motion).toBe("paused");
  media.matches = false;
  act(() => media.addEventListener.mock.calls[0][1]());
  expect(document.documentElement.dataset.motion).toBe("playing");
  view.unmount();
  expect(document.documentElement.dataset.motion).toBeUndefined();
  expect(media.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
});
