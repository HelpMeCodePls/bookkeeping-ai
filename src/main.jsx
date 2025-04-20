import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

// ⚡ 用一个函数包住 Mock 初始化
async function enableMocks() {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // 可选，看你的设置
    });
  }
}

// ⚡ 启动 Mock（不阻塞 React 渲染）
enableMocks();

// ⚠️ 换成你的 Google Client ID
// const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <GoogleOAuthProvider clientId={GOOGLE_ID}> */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    {/* </GoogleOAuthProvider> */}
  </React.StrictMode>,
)
