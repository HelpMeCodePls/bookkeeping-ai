import { create } from 'zustand'
import dayjs from 'dayjs'

export const useLedger = create((set) => ({
  currentId  : 'demoLedger',
  month      : dayjs().format('YYYY-MM'),           // '2025-05'
  budget     : 1000,
  setId      : (id) => set({ currentId: id }),
  setMonth   : (m) => set({ month: m }),
  setBudget  : (b) => set({ budget: b }),
}))
