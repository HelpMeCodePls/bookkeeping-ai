// src/components/ConnectionIndicator.jsx

import { useAuthStore } from "../store/auth";

export default function ConnectionIndicator() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-lg">
        {user.avatar || "👤"}
      </div>

      <span className="font-medium">{user.name || "Unknown"}</span>
    </div>
  );
}

// import { useEffect, useState } from 'react'
// import socketService from '../utils/socket'

// export default function ConnectionIndicator() {
//     const [status, setStatus] = useState('connecting')

//     useEffect(() => {
//       const updateStatus = () => {
//         if (socketService.socket?.connected) {
//           setStatus('connected')
//         } else {
//           setStatus('disconnected')
//         }
//       }

//       socketService.on('connect', updateStatus)
//       socketService.on('disconnect', updateStatus)

//       updateStatus()

//       return () => {
//         socketService.off('connect', updateStatus)
//         socketService.off('disconnect', updateStatus)
//       }
//     }, [])

//     const handleTest = () => {
//       console.log('Testing WebSocket connection...')
//       if (socketService.testConnection()) {
//         console.log('Test message sent successfully')
//       } else {
//         console.error('Failed to send test message')
//       }
//     }

//     const statusClasses = {
//       connecting: 'bg-yellow-500',
//       connected: 'bg-green-500',
//       disconnected: 'bg-red-500'
//     }

//     return (
//       <div className="flex items-center gap-2 text-sm">
//         <div className={`w-3 h-3 rounded-full ${statusClasses[status]}`} />
//         <span>
//           {status === 'connecting' && 'Connecting...'}
//           {status === 'connected' && 'Live'}
//           {status === 'disconnected' && 'Offline'}
//         </span>
//         <button
//           onClick={handleTest}
//           className="text-xs underline"
//         >
//           Test
//         </button>
//       </div>
//     )
//   }

// src/components/ConnectionIndicator.jsx
// export default function ConnectionIndicator() {
//     return (
//       <div className="flex items-center gap-2 text-sm">
//         <div className="w-3 h-3 rounded-full bg-green-500" />
//         <span>Online</span>
//       </div>
//     )
//   }
