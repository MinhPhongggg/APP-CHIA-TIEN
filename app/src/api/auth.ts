// src/api/auth.ts
import { QueryClient } from "@tanstack/react-query";
import { api, setAuth } from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthResp = {
  userId:number; email:string; displayName:string; accessToken:string; tokenType:string;
};

export async function registerApi(p:{email:string;displayName:string;password:string}): Promise<AuthResp> {
  const r = await api.post<AuthResp>("/auth/register", p);
  return r.data;
}

export async function loginApi(p:{email:string;password:string}): Promise<AuthResp> {
  const r = await api.post<AuthResp>("/auth/login", p);
  return r.data;
}
export async function signOut(qc?: QueryClient) {
  try {
    await AsyncStorage.removeItem("accessToken"); 
    setAuth(undefined);                           
    qc?.clear();
  } catch {}
}