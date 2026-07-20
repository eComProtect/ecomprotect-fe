import ax, { AxiosError } from "axios";
import { fetchSessionToken, isEmbedded } from "./appbridge.config";
import { getStaffToken } from "./staffsession";

export const envirnoment = import.meta.env.VITE_NODE_ENV;
export type ErrorWithMessage = AxiosError<WithMessage>;
export interface WithMessage {
  message: string;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const sanitizeBackendOrigin = (domain: string) => {
  const normalized = trimTrailingSlash(domain);
  return normalized.endsWith("/api")
    ? normalized.slice(0, -"/api".length)
    : normalized;
};

export const backendOrigin = sanitizeBackendOrigin(
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
);
export const url = `${backendOrigin}/api`;

export const axios = ax.create({
  baseURL: url,
  withCredentials: true,
});

// When running embedded in Shopify Admin, third-party cookies are unreliable inside
// the iframe, so we authenticate with a fresh App Bridge session token (JWT) on every
// request. The backend verifies it via shopify.session.decodeSessionToken (see
// auth.middleware.ts). Outside the iframe we fall back to the existing cookie session.
axios.interceptors.request.use(async (config) => {
  if (isEmbedded) {
    const token = await fetchSessionToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // Staff members have no identity of their own in the App Bridge token
    // above (it only proves "this is the shop") — if they've identified
    // themselves this browser session, ride their own session token along
    // separately so the backend can resolve their actual staff record.
    const staffToken = getStaffToken();
    if (staffToken) {
      config.headers.set("x-staff-token", staffToken);
    }
  }
  return config;
});

// Offline Shopify tokens have no refresh flow once expired — the backend
// returns { error: "SHOPIFY_TOKEN_EXPIRED", reAuthUrl } (401) when a token
// can't be silently renewed, and nothing was previously acting on that
// response: requests just failed and data quietly disappeared with no
// explanation or way to recover. Redirect straight to reAuthUrl (re-running
// OAuth), the same as EmbeddedEntry's own needs_login recovery path.
//
// v3 needed App Bridge's Redirect.Action.REMOTE to break out of the Admin
// iframe to the top-level window. v4 has no equivalent API — Shopify's own
// migration guide replaces it with a plain window.open(url, '_top'), which
// works identically whether or not we're actually embedded (outside an
// iframe, '_top' just targets the current window).
let reAuthRedirectInFlight = false;

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; reAuthUrl?: string }>) => {
    const data = error.response?.data;

    if (
      error.response?.status === 401 &&
      data?.error === "SHOPIFY_TOKEN_EXPIRED" &&
      data.reAuthUrl &&
      !reAuthRedirectInFlight
    ) {
      reAuthRedirectInFlight = true;
      window.open(data.reAuthUrl, "_top");
    }

    return Promise.reject(error);
  }
);
