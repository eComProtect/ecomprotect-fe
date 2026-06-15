import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { axios } from "@/configs/axios.config";
import { Home } from "./home.page";

/**
 * Root route ("/") entry point.
 *
 * Shopify Admin loads embedded apps at `/?shop=...&host=...&embedded=1`.
 *  - Not embedded (no shop/host)  → render the public marketing site (Home).
 *  - Embedded + app is installed  → send the merchant to the dashboard.
 *  - Embedded + not installed yet → kick off OAuth via /install (which redirects to
 *    the backend /shopify/install).
 *
 * "Installed?" can't be read from a cookie inside the iframe (third-party cookies are
 * blocked), so we probe a token-authenticated endpoint. The axios interceptor attaches
 * the App Bridge session token; the backend resolves the shop from it. A 401 means the
 * shop has no stored offline token yet → (re)install.
 */
const EmbeddedEntry = () => {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");
  const embedded = Boolean(shop && host);

  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (!embedded) return;
    let cancelled = false;

    (async () => {
      try {
        // 1) Is the shop installed? (token-authenticated probe → 401 if not)
        await axios.get("/user/me");

        // 2) Does it have an active app subscription? Gate the dashboard on it.
        try {
          const { active } = (await axios.get("/billing/status")).data;
          if (!cancelled) {
            setDestination(active ? "/user/customer-management" : "/billing");
          }
        } catch {
          // Billing status unavailable — don't hard-block; let them into the app.
          if (!cancelled) setDestination("/user/customer-management");
        }
      } catch (err) {
        const statusCode = (err as { response?: { status?: number } })?.response
          ?.status;
        if (statusCode === 401) {
          // Shop not installed / token revoked → begin OAuth.
          window.location.replace(`/install?shop=${encodeURIComponent(shop!)}`);
        } else if (!cancelled) {
          // Transient error — show the app and let normal data hooks retry.
          setDestination("/user/customer-management");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [embedded, shop]);

  if (!embedded) return <Home />;
  if (!destination) return null;
  return <Navigate to={destination} replace />;
};

export default EmbeddedEntry;
