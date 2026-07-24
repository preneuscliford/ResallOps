import { createClient } from "@supabase/supabase-js";
import { appEnv, hasSupabaseBrowserEnv } from "@/lib/env";

export function getSupabaseBrowserClient() {
  if (!hasSupabaseBrowserEnv()) {
    throw new Error("Supabase n'est pas configure. Renseignez les variables d'environnement.");
  }

  return createClient(appEnv.supabaseUrl!, appEnv.supabaseAnonKey!);
}
