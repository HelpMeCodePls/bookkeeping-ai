import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
// import axios from "axios";
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationRead,
  } from "../handlers/notificationHandlers";
import NotificationItem from "../components/NotificationItem";
import { useState } from "react";
// import socketService from '../utils/socket';
import { useAuthStore } from "../store/auth";
import { motion } from "framer-motion";

export default function AlertsPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  // const [unreadCount, setUnreadCount] = useState(0)

  // const { data: notifications = [] } = useQuery({
  //   queryKey: ['notifications'],
  //   queryFn: () => axios.get('/notifications').then(r => r.data),
  //   onSuccess: (data) => {
  //     setUnreadCount(data.filter(n => !n.is_read).length)
  //   }
  // })

  //   // 初始化 WebSocket
  //   useEffect(() => {
  //     if (user?.access_token) {
  //       socketService.connect(user.access_token)

  //       const handleNotification = (data) => {
  //         console.log('New notification:', data)
  //         queryClient.invalidateQueries(['notifications'])

  //         // 显示桌面通知
  //         if (Notification.permission === 'granted') {
  //           new Notification('New Notification', {
  //             body: data.content,
  //             icon: '/logo192.png'
  //           })
  //         }
  //       }

  //       socketService.on('notification', handleNotification)

  //       return () => {
  //         socketService.off('notification', handleNotification)
  //       }
  //     }
  //   }, [user, queryClient])

  //   // 请求通知权限
  //   useEffect(() => {
  //     if (Notification.permission !== 'granted' &&
  //         Notification.permission !== 'denied') {
  //       Notification.requestPermission()
  //     }
  //   }, [])

  //   useEffect(() => {
  //     const handleNotification = () => {
  //       console.log('Refreshing notifications...')
  //       queryClient.invalidateQueries(['notifications'])
  //     }

  //     socketService.on('notification', handleNotification)
  //     return () => socketService.off('notification', handleNotification)
  //   }, [queryClient])

  // 查询通知（15秒轮询一次）
  // const { data: notificationsResponse } = useQuery({
  //   queryKey: ["notifications"],
  //   queryFn: async () => {
  //     try {
  //       const res = await axios.get("/notifications", { params: { token } });
  //       // 确保返回数组格式
  //       if (Array.isArray(res.data)) {
  //         return res.data;
  //       } else if (Array.isArray(res.data?.data)) {
  //         return res.data.data;
  //       }
  //       return []; // 默认返回空数组
  //     } catch (e) {
  //       console.error("Failed to fetch notifications", e);
  //       return [];
  //     }
  //   },
  //   refetchInterval: 15000,
  //   enabled: !!token,
  // });

  const { data: notificationsResponse = [] } = useQuery({
      queryKey: ["notifications"],
      queryFn: fetchNotifications,
      refetchInterval: 15000,
      enabled: !!token,
    });

  // 确保 notifications 是数组
  const notifications = Array.isArray(notificationsResponse)
    ? notificationsResponse
    : [];

  // 查询未读数（30秒轮询一次）
  // const { data: unreadCount = 0 } = useQuery({
  //   queryKey: ["notifications", "unread"],
  //   queryFn: async () => {
  //     try {
  //       const res = await axios.get("/notifications/unread_count", {
  //         params: { token },
  //       });
  //       // 确保返回数字
  //       return Number(res.data?.count) || 0;
  //     } catch (e) {
  //       console.error("Failed to fetch unread count", e);
  //       return 0;
  //     }
  //   },
  //   refetchInterval: 30000,
  //   enabled: !!token,
  // });

  const { data: unreadCount = 0 } = useQuery({
      queryKey: ["notifications", "unread"],
      queryFn: fetchUnreadCount,
      refetchInterval: 30000,
      enabled: !!token,
    });

  // 过滤通知
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true; // 'all'
  });

  // // 请求通知权限（保留原有功能）
  // const requestNotificationPermission = () => {
  //     if (Notification.permission !== 'granted' &&
  //         Notification.permission !== 'denied') {
  //       Notification.requestPermission().then(permission => {
  //         console.log('Notification permission:', permission)
  //       })
  //     }
  //   }

  // 未读计数
  //   const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div
      className="p-6" // 根据页面需要调整
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }} // 可选：如果有路由切换，可以加 exit
      transition={{ duration: 0.25 }}
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* 筛选选项卡 */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${
              filter === "all" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 ${
              filter === "unread" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </button>
          <button
            className={`px-4 py-2 ${
              filter === "read" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setFilter("read")}
          >
            Read
          </button>
        </div>

        {/* 通知列表 */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications 🎉
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
