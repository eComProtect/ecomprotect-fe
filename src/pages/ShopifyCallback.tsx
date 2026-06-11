import { useEffect } from "react";

const ShopifyCallback = () => {
  useEffect(() => {
    // No more token-in-URL / cookie handling. The backend OAuth callback now
    // redirects straight to `/?shop=...&host=...`; if anything still lands here,
    // forward those params on to the embedded entry point so App Bridge can boot.
    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop") ?? "";
    const host = params.get("host") ?? "";
    const next = new URLSearchParams();
    if (shop) next.set("shop", shop);
    if (host) next.set("host", host);
    window.location.replace(`/?${next.toString()}`);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm font-medium text-gray-700">
          Setting up your store...
        </p>
      </div>
    </main>
  );
};

export default ShopifyCallback;
