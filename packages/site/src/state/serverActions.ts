// @ts-nocheck
import { supabase, recreateClient } from "./supabaseClient";
import { setupStore, user } from "./sessionStore";
import { get } from "svelte/store";

const BASE_URL = process.env.BASE_URL || "";

export async function login(redirectTo: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signIn(
      { provider: "github" },
      { redirectTo: `${BASE_URL}${redirectTo}` }
    );
    if (error) throw error;
  }
}

export function createLoginWindow(): void {
  // set up a callback on the window object that the
  // child window can call
  window["loginSuccess"] = () => {
    // need to recreate the client based on our new credentials
    recreateClient();
    setupStore();
  };

  const url = `${BASE_URL}/login/`;
  const name = "login";
  const specs = "width=500,height=600";
  const authWindow = window.open(url, name, specs);
  authWindow.focus();
}

export async function logout(): Promise<void> {
  const { error } = supabase && (await supabase.auth.signOut());
  if (error) throw error;
}

interface StoredDocument {
  content: string;
  title: string;
  id?: string;
}

interface DocumentSummary {
  title: string;
  id: string;
}

export async function getDocument(documentId: string): Promise<string> {
  if (supabase) {
    const { data, error } = await supabase
      .from<StoredDocument>("documents")
      .select("content")
      .eq("id", documentId);
    if (error) throw error;
    return data && data.length && data[0].content ? data[0].content : undefined;
  }
  return undefined;
}

export async function saveDocument(document: StoredDocument): Promise<string> {
  if (supabase) {
    const { data, error } = await supabase
      .from<StoredDocument>("documents")
      .upsert({
        ...document,
        user_id: get(user)["id"] as string,
      });
    if (error) throw error;
    // @ts-ignore
    return data && data.length ? (data[0] as string) : undefined;
  }

  return undefined;
}

export async function getDocumentSummariesForUser(): Promise<
  DocumentSummary[]
> {
  if (supabase) {
    const { data, error } = await supabase
      .from("documents")
      .select("id,title")
      .eq("user_id", get(user)["id"]);
    if (error) throw error;
    return data;
  }

  return undefined;
}
