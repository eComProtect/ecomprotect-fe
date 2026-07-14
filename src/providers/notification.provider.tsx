import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useFetchNotification } from "@/hooks/notifications/usegetnotification";
import { useMarkNotificationAsRead } from "@/hooks/notifications/usemarkread";
import { useIdentity } from "@/hooks/useidentity";
import { getNotificationSocket } from "@/configs/socket.config";

interface NotificationBackend {
  id: string;
  storeId: string;
  customerId: string | null;
  customerName: string | null;
  type: string;
  title: string;
  message: string;
  meta: any;
  read: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface NotificationContextType {
  notifications: NotificationBackend[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  markAsSeen: (id: string) => Promise<void>;
  reload: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, isError } = useFetchNotification();
  const [notifications, setNotifications] = useState<NotificationBackend[]>([]);
  const { mutate } = useMarkNotificationAsRead();
  const { isAuthenticated } = useIdentity();

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data]);

  // Live updates: prepend new notifications as they're created (risky-order/
  // refund webhooks), instead of only ever seeing them on next page load or
  // window focus. Only connect once authenticated — this provider wraps the
  // whole app, including public/marketing pages with nothing to subscribe to.
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getNotificationSocket();
    socket.connect();

    const handleNewNotification = (notification: NotificationBackend) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsSeen = async (id: string) => {
    mutate(id);
  };

  const reload = () => {};

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, isError, markAsSeen, reload }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return ctx;
};
