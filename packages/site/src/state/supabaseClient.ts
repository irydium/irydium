import { createClient } from "@supabase/supabase-js";

interface API {
  SUPABASE_URL: string,
  SUPABASE_ANON_KEY: string
}

declare var __api: API;

const supabaseUrl = __api.SUPABASE_URL;
const supabaseAnonKey = __api.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
