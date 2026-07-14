import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import { usePushNotification } from "@/hooks/notifications/usePushNotification";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";

type Outcome = "idle" | "success" | "failed";

/**
 * Standalone, non-embedded page for enabling push notifications.
 *
 * Browsers block Notification.requestPermission() inside a cross-origin
 * iframe (which is exactly what this app is when embedded in Shopify Admin),
 * so the dashboard's "Enable push notifications" button opens this page in a
 * new top-level tab (window.open) instead of prompting inline. Identifies
 * the store via ?shop=... in the URL rather than a session — this tab has
 * none of its own.
 */
const EnableNotificationsPage = () => {
  const { subscribe, isSubscribing, error, isSupported } = usePushNotification();
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const attempted = useRef(false);

  const shop = new URLSearchParams(window.location.search).get("shop") ?? "";

  useEffect(() => {
    if (attempted.current || !shop) return;
    attempted.current = true;

    (async () => {
      const ok = await subscribe(shop);
      setOutcome(ok ? "success" : "failed");
    })();
  }, [shop, subscribe]);

  useEffect(() => {
    if (outcome !== "success") return;
    const timer = setTimeout(() => window.close(), 4000);
    return () => clearTimeout(timer);
  }, [outcome]);

  return (
    <Flex className="min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      {!shop ? (
        <>
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium text-gray-800">
            Missing store information — please reopen this from the app's
            Notifications page.
          </p>
        </>
      ) : !isSupported ? (
        <>
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium text-gray-800">
            Push notifications aren't supported in this browser.
          </p>
        </>
      ) : outcome === "success" ? (
        <>
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="text-lg font-medium text-gray-800">
            Push notifications enabled for {shop}.
          </p>
          <p className="text-sm text-gray-500">
            You can close this tab and return to Shopify Admin.
          </p>
          <Button onClick={() => window.close()}>Close this tab</Button>
        </>
      ) : outcome === "failed" ? (
        <>
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="text-lg font-medium text-gray-800">
            {error || "Could not enable push notifications."}
          </p>
          <Button
            onClick={async () => setOutcome((await subscribe(shop)) ? "success" : "failed")}
            disabled={isSubscribing}
          >
            {isSubscribing ? "Retrying…" : "Try again"}
          </Button>
        </>
      ) : (
        <>
          <Bell className="h-12 w-12 animate-pulse text-blue-600" />
          <p className="text-lg font-medium text-gray-800">
            Requesting notification permission…
          </p>
        </>
      )}
      <Box className="mt-2 w-full max-w-sm text-xs text-gray-400">
        This tab was opened separately from Shopify Admin because browsers
        don't allow notification prompts inside an embedded app.
      </Box>
    </Flex>
  );
};

export default EnableNotificationsPage;
