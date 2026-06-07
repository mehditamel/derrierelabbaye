/** Retour haptique discret (progressive enhancement, sans effet si non supporté). */
export function haptic(pattern: number | number[] = 12): void {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* best-effort */
  }
}
