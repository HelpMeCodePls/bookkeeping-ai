import { useEffect, useState } from 'react'

export default function useNotificationPermission() {
  const [permission, setPermission] = useState(Notification.permission)

  useEffect(() => {
    const checkPermission = () => {
      setPermission(Notification.permission)
    }

    // 监听权限变化
    Notification.requestPermission().then(checkPermission)
    
    return () => {
      // 清理
    }
  }, [])

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  return { permission, requestPermission }
}