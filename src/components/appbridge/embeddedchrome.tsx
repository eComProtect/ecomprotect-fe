import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";

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
 * v4 has no useToast hook and no secondaryActions prop on TitleBar — both
 * are reached through the useAppBridge() global (shopify.toast.show(...)),
 * and TitleBar actions are now plain React children (buttons), not a
 * config-object prop.
 */
export const EmbeddedChrome = ({ latestNotification, unreadCount }: EmbeddedChromeProps) => {
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const lastShownId = useRef<string | null>(null);

  useEffect(() => {
    if (!latestNotification || latestNotification.id === lastShownId.current) {
      return;
    }
    lastShownId.current = latestNotification.id;
    shopify.toast.show(latestNotification.title || latestNotification.message, {
      duration: 6000,
    });
  }, [latestNotification, shopify]);

  return (
    <TitleBar title={unreadCount > 0 ? `eComProtect (${unreadCount})` : "eComProtect"}>
      <button variant="primary" onClick={() => navigate("/user/notification")}>
        {unreadCount > 0 ? `${unreadCount} unread` : "Notifications"}
      </button>
    </TitleBar>
  );
};
