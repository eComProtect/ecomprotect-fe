import { useEffect, useState } from "react";

const ShopifyLoadingState = ({ text }: { text: string }) => (
  <main className="flex min-h-screen items-center justify-center bg-white px-6">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      <p className="text-sm font-medium text-gray-700">{text}</p>
    </div>
  </main>
);

export const ShopifyInstall = () => {
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop")?.trim() ?? "";

    if (!shop.endsWith(".myshopify.com")) {
      setError("Invalid shop URL.");
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    const installUrl = `${apiUrl}/shopify/install?shop=${encodeURIComponent(shop)}`;

    // Inside the Admin iframe, a same-frame redirect only navigates the
    // iframe, so the OAuth state cookie would be set in a blocked
    // third-party context. '_top' targets the topmost browsing context —
    // this works identically whether or not we're actually embedded (outside
    // an iframe, '_top' just resolves to the current window) — so OAuth
    // always runs first-party and the cookie survives through to
    // /shopify/callback. (App Bridge v3's Redirect.Action.REMOTE did this
    // same thing via an extra layer of indirection; v4 has no equivalent API
    // — Shopify's own migration guide replaces it with plain window.open.)
    window.open(installUrl, "_top");
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <p className="text-sm font-medium text-red-600">{error}</p>
      </main>
    );
  }

  return <ShopifyLoadingState text="Connecting to Shopify..." />;
};
