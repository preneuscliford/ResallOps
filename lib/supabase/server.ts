import { createClient } from "@supabase/supabase-js";
import { appEnv, hasSupabaseServerEnv } from "@/lib/env";

export function getSupabaseServerClient() {
  if (!hasSupabaseServerEnv()) {
    throw new Error("Supabase serveur n'est pas configure.");
  }

  return createClient(appEnv.supabaseUrl!, appEnv.supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
