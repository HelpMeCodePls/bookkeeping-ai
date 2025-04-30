import { useEffect, useState } from "react";

export default function useNotificationPermission() {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    const checkPermission = () => {
      setPermission(Notification.permission);
    };

    Notification.requestPermission().then(checkPermission);

    return () => {};
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return { permission, requestPermission };
}
