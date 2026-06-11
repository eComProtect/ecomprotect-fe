import { useEffect, useState } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { getAppBridge, isEmbedded } from "@/configs/appbridge.config";

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

    const app = getAppBridge();
    if (isEmbedded && app) {
      // Inside the Admin iframe, a plain redirect only navigates the iframe, so the
      // OAuth state cookie would be set in a blocked third-party context. Use App
      // Bridge REMOTE redirect to drive the TOP-LEVEL window to the install URL, so
      // OAuth runs first-party and the cookie survives through to /shopify/callback.
      Redirect.create(app).dispatch(Redirect.Action.REMOTE, installUrl);
    } else {
      window.location.href = installUrl;
    }
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
