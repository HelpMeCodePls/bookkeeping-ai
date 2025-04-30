import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// const eventBus = {
//     listeners: new Map(),
//     emit(event, data) {
//       const callbacks = this.listeners.get(event) || []
//       callbacks.forEach(cb => cb(data))
//     },
//     on(event, callback) {
//       if (!this.listeners.has(event)) {
//         this.listeners.set(event, [])
//       }
//       this.listeners.get(event).push(callback)
//     }
//   }

const worker = setupWorker(...handlers);

// const eventSystem = {
//     listeners: new Map(),
//     emit(event, data) {
//       const handlers = this.listeners.get(event) || []
//       handlers.forEach(handler => handler(data))
//     },
//     on(event, handler) {
//       if (!this.listeners.has(event)) {
//         this.listeners.set(event, [])
//       }
//       this.listeners.get(event).push(handler)
//     }
//   }

// export const mockSocket = {
//   emit: (event, data) => {
//     console.log(`[MOCK] Emitting ${event}`, data)
//     eventSystem.emit(event, data)
//   },
//   on: (event, handler) => eventSystem.on(event, handler)
// }

if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: "bypass",
  });
}

// export const mockWebSocket = {
//     listeners: new Map(),
//     connected: true,

//     disconnect() {
//         this.connected = false;
//         this.emit('disconnect');
//     },
//     emit(event, data) {
//       console.log(`[MOCK WS] Emitting ${event}`, data)
//       const handlers = this.listeners.get(event) || []
//       handlers.forEach(handler => handler(data))

//       eventSystem.emit(event, data)
//     },
//     on(event, handler) {
//       if (!this.listeners.has(event)) {
//         this.listeners.set(event, [])
//       }
//       this.listeners.get(event).push(handler)
//     },
//     connect() {
//       console.log('[MOCK] WebSocket connected')
//       this.connected = true
//     }
//   }

// mockWebSocket.on('test', (data) => {
//     console.log('[MOCK] Received test:', data)
//     mockWebSocket.emit('notification', {
//       type: 'test',
//       content: 'Test reply from server',
//       original: data,
//       time: new Date().toISOString()
//     })
//   })

// worker.start({
//     onUnhandledRequest: 'bypass',
//     quiet: true
//   })

export { worker };
