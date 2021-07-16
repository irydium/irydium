import { createClient } from "@supabase/supabase-js";

interface API {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

declare var __api: API;

const supabaseUrl = __api.SUPABASE_URL;
const supabaseAnonKey = __api.SUPABASE_ANON_KEY;

export let supabase =
  __api.SUPABASE_URL && createClient(supabaseUrl, supabaseAnonKey);

export function recreateClient() {
  supabase = __api.SUPABASE_URL && createClient(supabaseUrl, supabaseAnonKey);
}
