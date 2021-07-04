import { writable } from "svelte/store";
import { supabase } from "./supabaseClient"

export const user = writable<Object>(false);

export function setupStore() {
  user.set(supabase.auth.user());
  supabase.auth.onAuthStateChange((_, session) => {
    user.set(session && session.user);
  });
}
