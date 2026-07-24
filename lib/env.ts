export const appEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "ResallOps Radar",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function hasSupabaseBrowserEnv() {
  return Boolean(appEnv.supabaseUrl && appEnv.supabaseAnonKey);
}

export function hasSupabaseServerEnv() {
  return Boolean(appEnv.supabaseUrl && appEnv.supabaseServiceRoleKey);
}
