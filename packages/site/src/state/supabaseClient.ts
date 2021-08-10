import { createClient } from "@supabase/supabase-js";

interface API {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

declare const __api: API;

const supabaseUrl = __api.SUPABASE_URL;
const supabaseAnonKey = __api.SUPABASE_ANON_KEY;

export let supabase =
  __api.SUPABASE_URL && createClient(supabaseUrl, supabaseAnonKey);

export function recreateClient(): void {
  supabase = __api.SUPABASE_URL && createClient(supabaseUrl, supabaseAnonKey);
}
