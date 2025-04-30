import { create } from 'zustand'
import dayjs from 'dayjs'

export const useLedger = create((set) => ({
  currentId: null,
  currentName: "",
  month: dayjs().format('YYYY-MM'),
  budget: 1000,
  
  // 更新这些方法
  setId: (id) => set({ currentId: id }),
  setMonth: (m) => set({ month: m }),
  setBudget: (b) => set({ budget: b }),
  setLedger: ({ id, name, month }) => set({ currentId: id, currentName: name, month }),
  
  // 添加这个新方法
  selectLedger: (ledger) => set({ 
    currentId: ledger._id, 
    currentName: ledger.name,
    month: dayjs().format('YYYY-MM')
  }),
}))