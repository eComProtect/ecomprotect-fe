import { Navigate, useLocation } from "react-router-dom";
import { authClient } from "@/providers/user.provider";
import { useIdentity } from "@/hooks/useidentity";
import { shop, host } from "@/configs/appbridge.config";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useIdentity();
  const location = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    // Never auto-trigger Shopify OAuth from here — that must only ever happen
    // via a deliberate action. This used to do window.location.replace to
    // /install (which itself immediately redirects to Shopify's OAuth
    // authorize screen on mount, no click involved) whenever `isEmbedded`
    // (Boolean(host) read from the URL query string) was true. But shop/host
    // params can persist on the standalone site too — a bookmarked link, the
    // reAuthUrl '_top' bounce, EmbeddedStaffGate's own returnTo redirect — so
    // that heuristic fired a fully automatic redirect to Shopify's OAuth
    // authorize URL even for standalone merchants who were simply
    // unauthenticated for a moment (e.g. session still loading).
    //
    // Always send to /signin instead, forwarding shop/host so embedded
    // context isn't lost: EmbeddedStaffGate already redirects unauthenticated
    // embedded sessions to this exact "/signin?shop=&host=&returnTo=" shape,
    // and a genuinely expired Shopify token surfaces separately via the
    // axios response interceptor's SHOPIFY_TOKEN_EXPIRED handling (a
    // deliberate reaction to an actual failed request, not a page-load
    // guess).
    const params = new URLSearchParams();
    if (shop) params.set("shop", shop);
    if (host) params.set("host", host);
    params.set("returnTo", location.pathname + location.search);
    return <Navigate to={`/signin?${params.toString()}`} replace />;
  }

  return <>{children}</>;
};

// Only for public pages like /signin
export const PublicOnlyRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isPending } = authClient.useSession();

  if (isPending) return null;

  if (data?.session?.token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};