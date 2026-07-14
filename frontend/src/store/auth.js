import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("sn_token", token);
        set({ user, token });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem("sn_token");
        set({ user: null, token: null });
      },
      isAuthed: () => !!get().token,
    }),
    { name: "sn_auth" }
  )
);
