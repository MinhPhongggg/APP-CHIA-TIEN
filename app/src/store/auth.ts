import { create } from "zustand";

type AuthState = {
  token: string | null;
  setAuthToken: (t: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setAuthToken: (t) => set({ token: t }),
}));

export const useAuthToken = () => useAuthStore((s) => s.token);
export const useSetAuthToken = () => useAuthStore((s) => s.setAuthToken);
