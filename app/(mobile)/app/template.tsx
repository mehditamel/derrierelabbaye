import type { ReactNode } from "react";

/** Remonté à chaque navigation : fondu doux entre les écrans de l'app. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="app-screen-in">{children}</div>;
}
