import { useIdentity } from "@/hooks/useidentity";
import { Box } from "@/components/ui/box";

/**
 * A merchant only ever reaches this dashboard after completing Shopify OAuth
 * install (see /install, /shopify/callback), which is what sets shopify_url.
 * This banner covers the edge case where that row is somehow missing it —
 * it is informational only, unlike the manual credential-entry form it
 * replaced, which asked merchants to type in a myshopify.com domain and
 * paste custom-app credentials. Shopify's App Store requirements prohibit
 * initiating or repairing an installation from anything but a Shopify-owned
 * surface, so the only action offered here is reinstalling from Shopify.
 */
export const NotConnectedBanner = () => {
  const { user, isLoading } = useIdentity();

  if (isLoading || user?.shopify_url) {
    return null;
  }

  return (
    <Box className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      This account isn't connected to a Shopify store yet. Orders, customers,
      and risk checks stay empty until you install (or reinstall) the app from
      your Shopify admin.
    </Box>
  );
};
