import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('jwt') || null,
  user: null,
  setAuth: ({ token, user }) => {
    localStorage.setItem('jwt', token)
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('jwt')
    set({ token: null, user: null })
  },
}))
