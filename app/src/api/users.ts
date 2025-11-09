import { api } from "./axios";

export type UserSuggestion = { id:number; email:string; displayName:string };

export async function searchUsers(query: string): Promise<UserSuggestion[]> {
  const r = await api.get<UserSuggestion[]>("/users/search", { params: { query } });
  return r.data;
}
