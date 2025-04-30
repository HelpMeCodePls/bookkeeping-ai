import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLedger } from "../store/ledger";
// import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { markNotificationRead } from "../handlers/notificationHandlers";

dayjs.extend(relativeTime);

export default function NotificationItem({ notification }) {
  const { setId: setLedgerId } = useLedger();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  // const markAsRead = useMutation({
  //   mutationFn: () => axios.patch(`/notifications/${notification.id}`),
  //   onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  // });

  const markAsRead = useMutation({
    mutationFn: () => markNotificationRead(notification.id),

    onMutate: async () => {
      await queryClient.cancelQueries(["notifications"]);
      const prev = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );

      queryClient.setQueryData(["notifications", "unread"], (c = 0) =>
        Math.max(0, c - 1)
      );

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["notifications"], ctx.prev);
      queryClient.invalidateQueries(["notifications", "unread"]);
    },

    onSettled: () => {
      queryClient.invalidateQueries(["notifications"]);
      queryClient.invalidateQueries(["notifications", "unread"]);
    },
  });

  const handleMarkAsRead = useCallback(() => {
    if (!notification.is_read) {
      markAsRead.mutate();
    }
  }, [markAsRead, notification.is_read]);

  useEffect(() => {
    let timer;
    if (isHovered && !notification.is_read) {
      timer = setTimeout(handleMarkAsRead, 2000);
    }
    return () => clearTimeout(timer);
  }, [isHovered, handleMarkAsRead, notification.is_read]);

  const handleClick = () => {
    handleMarkAsRead();
    if (notification.ledgerId) {
      setLedgerId(notification.ledgerId);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "collaboration":
        return "👥";
      case "record":
        return "✏️";
      case "budget":
        return "💰";
      default:
        return "🔔";
    }
  };

  return (
    <div
      className={`border p-4 rounded-lg cursor-pointer transition-colors ${
        notification.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="font-medium">{notification.content}</div>
          <div className="text-sm text-gray-500 mt-1">
            {dayjs(notification.created_at).fromNow()}
          </div>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
        )}
      </div>
    </div>
  );
}
