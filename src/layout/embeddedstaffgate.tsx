import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isEmbedded, shop, host } from "@/configs/appbridge.config";
import { getStaffToken } from "@/configs/staffsession";

/**
 * Gates merchant-facing routes behind a one-time-per-browser-session staff
 * login when running embedded in Shopify Admin. See staffsession.ts for why:
 * the App Bridge token alone can't tell staff members apart from the owner.
 * A no-op outside the embedded context (standalone cookie login already
 * identifies the user correctly).
 *
 * Reuses the existing /signin page rather than a separate embedded-only
 * form — see signin.form.tsx for the returnTo/staff-token handling.
 */
export function EmbeddedStaffGate({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!isEmbedded || getStaffToken()) {
    return <>{children}</>;
  }

  const params = new URLSearchParams({ shop, host });
  params.set("returnTo", location.pathname + location.search);

  return <Navigate to={`/signin?${params.toString()}`} replace />;
}
