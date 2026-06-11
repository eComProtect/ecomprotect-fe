import createApp, { type ClientApplication } from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";

/**
 * Shopify App Bridge bootstrap (App Bridge v3).
 *
 * `host` and `shop` are provided by Shopify Admin when the app is loaded inside the
 * iframe (`/?shop=...&host=...&embedded=1`). We read them once at module load — the
 * values are stable for the lifetime of the embedded session.
 *
 * The same config drives <AppProvider> on the React side (see main.tsx) and the axios
 * request interceptor (see axios.config.tsx), which needs a token outside of React.
 */
const params = new URLSearchParams(window.location.search);

export const host = params.get("host") ?? "";
export const shop = params.get("shop") ?? "";
export const apiKey: string = import.meta.env.VITE_SHOPIFY_API_KEY ?? "";

/** True when the app is running embedded inside Shopify Admin. */
export const isEmbedded = Boolean(host);

export const appBridgeConfig = {
  apiKey,
  host,
  forceRedirect: true,
};

let app: ClientApplication | null = null;

/**
 * Lazily creates (and memoizes) the App Bridge instance. Returns null when the app is
 * not embedded (no host) or no apiKey is configured, so non-embedded/standalone usage
 * still works without throwing.
 */
export const getAppBridge = (): ClientApplication | null => {
  if (app) return app;
  if (!host || !apiKey) return null;
  app = createApp(appBridgeConfig);
  return app;
};

/**
 * Resolves a fresh, short-lived App Bridge session token (JWT) for authenticating
 * backend requests. Returns null when not embedded so callers can fall back to cookies.
 */
export const fetchSessionToken = async (): Promise<string | null> => {
  const instance = getAppBridge();
  if (!instance) return null;
  try {
    return await getSessionToken(instance);
  } catch {
    return null;
  }
};
