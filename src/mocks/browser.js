import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 创建自定义事件总线
const eventBus = {
    listeners: new Map(),
    emit(event, data) {
      const callbacks = this.listeners.get(event) || []
      callbacks.forEach(cb => cb(data))
    },
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(callback)
    }
  }
  
const worker = setupWorker(...handlers)

// 创建全局事件系统
const eventSystem = {
    listeners: new Map(),
    emit(event, data) {
      const handlers = this.listeners.get(event) || []
      handlers.forEach(handler => handler(data))
    },
    on(event, handler) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(handler)
    }
  }

// 导出给 handlers 使用
export const mockSocket = {
  emit: (event, data) => {
    console.log(`[MOCK] Emitting ${event}`, data)
    eventSystem.emit(event, data)
  },
  on: (event, handler) => eventSystem.on(event, handler)
}
  

// DEV 环境启动，并让未匹配的请求直接透传
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  });
}

// 模拟 WebSocket 行为
export const mockWebSocket = {
    listeners: new Map(),
    connected: true,

    disconnect() {
        this.connected = false;
        this.emit('disconnect');
    },
    emit(event, data) {
      console.log(`[MOCK WS] Emitting ${event}`, data)
      const handlers = this.listeners.get(event) || []
      handlers.forEach(handler => handler(data))
      
      // 同时触发全局事件
      eventSystem.emit(event, data)
    },
    on(event, handler) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(handler)
    },
    connect() {
      console.log('[MOCK] WebSocket connected')
      this.connected = true
    }
  }
// 初始化测试监听器
mockWebSocket.on('test', (data) => {
    console.log('[MOCK] Received test:', data)
    mockWebSocket.emit('notification', {
      type: 'test',
      content: 'Test reply from server',
      original: data,
      time: new Date().toISOString()
    })
  })
  
// 启动 worker
worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true
  })
  
  export { worker } 