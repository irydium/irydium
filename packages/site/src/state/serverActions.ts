import { supabase } from "./supabaseClient";
import { user } from "./sessionStore";
import { get } from 'svelte/store';

export async function login() {
  const { error } = await supabase.auth.signIn({ provider: "github" });
  if (error) throw error;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
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

export async function getDocument(documentId: string) {
  const { data, error, status } = await supabase
    .from("documents")
    .select("content")
    .eq("id", documentId);
  return (data.length) ? data[0].content : undefined;
}

export async function saveDocument(document: StoredDocument) {
  let { data, error, status } = await supabase
    .from("documents")
    .upsert({
      ...document,
      user_id: get(user)['id']
    });
  if (error) throw error;
  return data.length ? data[0] : undefined;
}

export async function getDocumentSummariesForUser(): Promise<DocumentSummary[]> {
  let { data, error, status } = await supabase
    .from("documents")
    .select("id,title")
    .eq("user_id", get(user)['id']);
  if (error) throw error;
  return data;
}
