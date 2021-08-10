import { writable } from "svelte/store";
import { supabase } from "./supabaseClient";

export const user = writable<unknown>(false);

export function setupStore(): void {
  if (!supabase) return;
  user.set(supabase.auth.user());
  supabase.auth.onAuthStateChange((_, session) => {
    user.set(session && session.user);
  });
}
