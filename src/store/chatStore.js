import { create } from "zustand";

export const useChatStore = create((set) => ({
  history: [],
  msg: "",
  isLoading: false,
  setMsg: (msg) => set({ msg }),
  addMessage: (msg) => set((s) => ({ history: [...s.history, msg] })),
  setLoading: (v) => set({ isLoading: v }),
  clearChat: () => set({ history: [], msg: "", isLoading: false }),
}));
