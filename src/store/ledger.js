import { create } from 'zustand'

export const useLedger = create((set) => ({
  currentId: 'demoLedger',
  setId: (id) => set({ currentId: id }),
  budget: 1000,
  setBudget: (budget) => set({ budget }),
}))
