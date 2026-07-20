import type { ShopifyGlobal } from "@shopify/app-bridge-types";

/**
 * Shopify App Bridge bootstrap (App Bridge v4).
 *
 * Unlike v3 (a createApp()/<Provider> pair driven from React), v4
 * self-initializes from the <meta name="shopify-api-key"> tag and CDN
 * <script> in index.html, exposing a global `window.shopify` object. There
 * is no npm-side createApp()/config object to build here anymore — this
 * file now just reads shop/host from the URL (same as before, still needed
 * by EmbeddedStaffGate, EmbeddedEntry, ShopifyInstall, etc.) and wraps
 * access to the global for session-token retrieval.
 */
declare global {
  interface Window {
    shopify?: ShopifyGlobal;
  }
}

const params = new URLSearchParams(window.location.search);

export const host = params.get("host") ?? "";
export const shop = params.get("shop") ?? "";

/** True when the app is running embedded inside Shopify Admin. */
export const isEmbedded = Boolean(host);

/**
 * Resolves a fresh, short-lived App Bridge session token (JWT) for
 * authenticating backend requests. `window.shopify` is a plain global set up
 * by the CDN script — callable from anywhere, including outside React (the
 * axios interceptor), not just via the useAppBridge() hook. Returns null when
 * not embedded, or if the global isn't available yet, so callers fall back
 * to cookies.
 */
export const fetchSessionToken = async (): Promise<string | null> => {
  if (!isEmbedded || !window.shopify) return null;
  try {
    return await window.shopify.idToken();
  } catch {
    return null;
  }
};
