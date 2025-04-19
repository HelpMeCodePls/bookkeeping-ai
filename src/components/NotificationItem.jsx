import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
import { useLedger } from '../store/ledger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function NotificationItem({ notification }) {
  const { setId: setLedgerId } = useLedger();
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: () => axios.patch(`/notifications/${notification.id}`),
    onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead.mutate();
    }
    
    // 根据通知类型跳转
    if (notification.ledgerId) {
      setLedgerId(notification.ledgerId);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'collaboration':
        return '👥';
      case 'record':
        return '✏️';
      case 'budget':
        return '💰';
      default:
        return '🔔';
    }
  };

  return (
    <div 
      className={`border p-4 rounded-lg cursor-pointer transition-colors ${
        notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
      }`}
      onClick={handleClick}
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