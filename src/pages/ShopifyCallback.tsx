import { useEffect } from "react";

const ShopifyCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Set for frontend domain
      document.cookie = `better-auth.session_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=None; Secure`;
      // Set for root domain to cover all subdomains
      document.cookie = `better-auth.session_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=None; Secure; domain=.ecomprotect.co.uk`;
      window.location.href = "/user/customer-management";
    }
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
