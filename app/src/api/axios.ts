import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: "http://10.0.2.2:8080/api", 
  timeout: 20000,
});

export function setAuth(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function bootstrapAuth() {
  const t = await AsyncStorage.getItem("accessToken");
  if (t) setAuth(t);
}



//mới
import { useAuthStore } from "../store/auth"; // nếu không có, bỏ interceptor này
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // clear header để tránh lặp 401
      setAuth(undefined);
      try { useAuthStore.getState().setAuthToken(null); } catch {}
    }
    return Promise.reject(err);
  }
);



