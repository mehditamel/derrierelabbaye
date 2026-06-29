/* =====================================================================
   Client Supabase — initialisé uniquement si les variables d'environnement
   sont présentes. En leur absence (démo, preview sans secrets), getSupabase()
   renvoie null et les services retombent sur leur comportement simulé.
   ===================================================================== */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Créé une seule fois (module singleton), seulement si la config existe.
let client: SupabaseClient | null = null;
if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/** Renvoie le client Supabase, ou null si l'app n'est pas configurée. */
export function getSupabase(): SupabaseClient | null {
  return client;
}

/** Vrai si un back-end Supabase est configuré (variables d'env présentes). */
export function supabaseConfigure(): boolean {
  return client !== null;
}
