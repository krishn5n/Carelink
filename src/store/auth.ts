// src/store/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "patient" | "doctor";
export interface User {
  id: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: "carelink-auth" }
  )
);


