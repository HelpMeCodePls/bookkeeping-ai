import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

// 创建查询客户端
const queryClient = new QueryClient()

// 启动应用的函数
async function startApp() {
  // 只在开发环境或明确启用 mock 时加载 mocks
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  }

  // 渲染应用
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// 启动应用
startApp().catch(console.error);
