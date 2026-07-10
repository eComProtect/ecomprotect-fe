import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { axios } from "@/configs/axios.config";
import { Home } from "./home.page";

type OnboardingStage = "needs_signup" | "needs_billing" | "needs_login" | "ready";

/**
 * Root route ("/") entry point.
 *
 * Shopify Admin loads embedded apps at `/?shop=...&host=...&embedded=1`.
 *  - Not embedded (no shop/host) → render the public marketing site (Home).
 *  - Embedded                    → ask the backend for this shop's onboarding stage
 *    (GET /api/onboarding/status?shop=...) and route accordingly. The axios
 *    interceptor already attaches the App Bridge session token to this request,
 *    so the backend resolves both "does a store exist for this shop" and "is
 *    there a valid session for it" in one call — no separate /user/me probe
 *    needed.
 */
const EmbeddedEntry = () => {
  const params = new URLSearchParams(window.location.search);
  const shop = params.get("shop");
  const host = params.get("host");
  const embedded = Boolean(shop && host);

  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (!embedded || !shop) return;
    let cancelled = false;

    (async () => {
      try {
        const { status } = (
          await axios.get<{ status: OnboardingStage }>("/onboarding/status", {
            params: { shop },
          })
        ).data;

        if (cancelled) return;

        switch (status) {
          case "needs_signup":
            // The store row already exists (OAuth install creates it with real
            // Shopify credentials) — it just needs the human profile details
            // filled in before moving on to billing.
            setDestination("/complete-profile");
            return;
          case "needs_billing":
            setDestination("/billing");
            return;
          case "needs_login":
            // There's no separate "log back in" step inside the iframe — an
            // embedded merchant's identity IS the App Bridge session token.
            // Re-running OAuth re-establishes a valid stored token the same
            // way a fresh install does.
            window.location.replace(`/install?shop=${encodeURIComponent(shop)}`);
            return;
          case "ready":
            setDestination("/user/customer-management");
            return;
        }
      } catch {
        // Status check itself failed (network/backend issue) — don't strand
        // the merchant on a blank screen; let them into the app and let
        // normal data hooks/guards handle it from there.
        if (!cancelled) setDestination("/user/customer-management");
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
