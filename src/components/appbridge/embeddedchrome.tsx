import { useEffect, useRef } from "react";
import { TitleBar, useToast } from "@shopify/app-bridge-react";

interface LiveNotification {
  id: string;
  title: string;
  message: string;
}

interface EmbeddedChromeProps {
  /** The most recently socket-delivered notification, or null if none yet this session. */
  latestNotification: LiveNotification | null;
  unreadCount: number;
}

/**
 * Wires the App Bridge Toast + TitleBar to the live notification stream.
 *
 * Must only ever be mounted inside <AppBridgeProvider> — useToast/TitleBar
 * both call useAppBridge() internally, which throws if there's no provider
 * in the tree. The caller (NotificationProvider) only renders this when
 * `isEmbedded` is true, so this component itself doesn't need to re-check.
 */
export const EmbeddedChrome = ({ latestNotification, unreadCount }: EmbeddedChromeProps) => {
  const { show } = useToast();
  const lastShownId = useRef<string | null>(null);

  useEffect(() => {
    if (!latestNotification || latestNotification.id === lastShownId.current) {
      return;
    }
    lastShownId.current = latestNotification.id;
    show(latestNotification.title || latestNotification.message, { duration: 6000 });
  }, [latestNotification, show]);

  return (
    <TitleBar
      title={unreadCount > 0 ? `eComProtect (${unreadCount})` : "eComProtect"}
      secondaryActions={[
        {
          content: unreadCount > 0 ? `${unreadCount} unread` : "Notifications",
          url: "/user/notification",
        },
      ]}
    />
  );
};
