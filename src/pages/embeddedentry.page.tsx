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

  const [ready, setReady] = useState(!embedded);

  useEffect(() => {
    if (!embedded) return;
    let cancelled = false;

    (async () => {
      try {
        // Cheap authenticated probe — returns 200 (possibly empty) when the shop is known.
        await axios.get("/notifications/get-notifications");
        if (!cancelled) setReady(true);
      } catch (err) {
        const statusCode = (err as { response?: { status?: number } })?.response
          ?.status;
        if (statusCode === 401) {
          // Shop not installed / token revoked → begin OAuth.
          window.location.replace(`/install?shop=${encodeURIComponent(shop!)}`);
        } else if (!cancelled) {
          // Transient error — show the app and let normal data hooks retry.
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [embedded, shop]);

  if (!embedded) return <Home />;
  if (!ready) return null;
  return <Navigate to="/user/customer-management" replace />;
};

export default EmbeddedEntry;
