/* =====================================================================
   Client Supabase — chargé À LA DEMANDE (import dynamique) et seulement si
   les variables d'environnement sont présentes. En leur absence (démo, preview
   sans secrets), getSupabase() renvoie null sans rien importer, et les services
   retombent sur leur comportement simulé. L'import dynamique sort par ailleurs
   @supabase/supabase-js du bundle initial des pages de réservation.
   ===================================================================== */

import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mémorisé une seule fois (la promesse fait office de singleton).
let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Renvoie le client Supabase, ou null si l'app n'est pas configurée.
 * Le module @supabase/supabase-js n'est chargé que si la config existe.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!url || !anonKey) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url, anonKey, { auth: { persistSession: false } })
    );
  }
  return clientPromise;
}

/** Vrai si un back-end Supabase est configuré (variables d'env présentes). */
export function supabaseConfigure(): boolean {
  return Boolean(url && anonKey);
}
