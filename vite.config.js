import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'frontend_build', 
    emptyOutDir: true,      
  },
  base: '/',
  // server: {
  //   proxy: {
  //     '/ledgers': 'http://localhost', 
  //     '/records': 'http://localhost', 
  //     '/categories': 'http://localhost',
  //     '/notifications': 'http://localhost',
  //     '/users': 'http://localhost',
  //     '/agent': 'http://localhost',
  //     '/ocr': 'http://localhost',
  //     '/charts': 'http://localhost',
  //   },
  // },
})
