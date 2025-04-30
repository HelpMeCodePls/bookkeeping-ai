// import { io } from 'socket.io-client'
// import { mockWebSocket } from '../mocks/browser'

// class SocketService {
//   constructor() {
//     this.socket = null
//     this.listeners = new Map()
//     this.isMock = import.meta.env.DEV
//   }

//   connect(token) {
//     if (this.isMock) {
//       console.log('[MOCK] WebSocket connected')
//     //   this.socket = {
//     //     connected: true,
//     //     emit: (event, data) => {
//     //       console.log(`[MOCK] Emitting ${event}:`, data)
//     //       mockWebSocket.emit(event, data)
//     //     }
//     //   }

//           this.socket = mockWebSocket

//           mockWebSocket.on('connect', () => this.emit('connect'))
//           mockWebSocket.on('disconnect', () => this.emit('disconnect'))
//           mockWebSocket.on('notification', (d) => this.emit('notification', d))

//           mockWebSocket.connect()
//           this.emit('connect')
//     return
//     }

//     if (this.socket?.connected) return

//     this.socket = io('http://localhost:3000', {
//       path: '/ws',
//       autoConnect: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 5000,
//       transports: ['websocket'],
//       query: { token }
//     })

//     this.socket.on('connect', () => {
//       console.log('WebSocket connected')
//       this.setupListeners()
//     })

//     this.socket.on('disconnect', () => {
//       console.log('WebSocket disconnected')
//     })

//     this.socket.on('error', (err) => {
//       console.error('WebSocket error:', err)
//     })
//   }

//   disconnect() {
//       if (!this.socket) return
//       if (typeof this.socket.disconnect === 'function') {
//         this.socket.disconnect()
//       } else if (this.isMock && this.socket.emit) {
//         // fallback for mock objects
//         this.socket.emit('disconnect')
//       }
//       this.socket = null
//     }

//   setupListeners() {
//     this.socket.on('notification', (data) => {
//       this.emit('notification', data)
//     })
//   }

//   on(event, callback) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, new Set())
//     }
//     this.listeners.get(event).add(callback)
//   }

//   off(event, callback) {
//     if (this.listeners.has(event)) {
//       this.listeners.get(event).delete(callback)
//     }
//   }

//   emit(event, ...args) {
//     if (this.listeners.has(event)) {
//       this.listeners.get(event).forEach(cb => cb(...args))
//     }
//   }

//   sendTestMessage() {
//     if (this.socket?.connected) {
//       this.socket.emit('test', {
//         message: 'This is a test message',
//         time: new Date().toISOString()
//       })
//     } else {
//       console.error('WebSocket not connected')
//     }
//   }
//   testConnection() {
//     if (!this.socket?.connected) {
//       console.error('WebSocket not initialized')
//       return false
//     }

//         this.socket.emit('test', {
//             message: 'Test from client',
//             time: new Date().toISOString()
//           })
//           return true
//   }}

// const socketService = new SocketService()
// export default socketService
