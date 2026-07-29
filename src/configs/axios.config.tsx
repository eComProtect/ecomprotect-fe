import ax, { AxiosError } from "axios";
import toast from "react-hot-toast";
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
// explanation or way to recover.
//
// Recovering means re-running OAuth, and reAuthUrl (shopifyReAuthUrl →
// /shopify/install) hands off to Shopify's authorize page, which for an
// embedded app lives on admin.shopify.com. Inside the Admin iframe that is
// exactly right — it's where the merchant already is, and it matches
// EmbeddedEntry's own needs_login recovery path. On the standalone website it
// is not: this used to fire for any such 401, including the very first
// dashboard data request after a store owner signed in on the website, and
// window.open('_top') drags the *whole tab* (outside an iframe '_top' is the
// current window) off the site and into Shopify Admin's embedded app.
//
// So: embedded keeps the automatic hand-off; standalone stays on the website
// and offers reconnecting as an action the merchant chooses to take.
let reAuthRedirectInFlight = false;

const CONNECT_SHOPIFY_PATH = "/user/connect-shopify";

const promptShopifyReconnect = () => {
  // Already on the connect screen (or its modal is up over the dashboard) —
  // the merchant is looking at the fix, so don't talk over it.
  if (window.location.pathname === CONNECT_SHOPIFY_PATH) return;

  // Shared id: repeat 401s (several data hooks usually fail together) update
  // this one toast instead of stacking up.
  toast.error(
    (t) => (
      <span className="flex items-center gap-3">
        This store isn't connected to Shopify, so store data can't load.
        <button
          type="button"
          className="shrink-0 rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
          onClick={() => {
            toast.dismiss(t.id);
            window.location.assign(CONNECT_SHOPIFY_PATH);
          }}
        >
          Connect
        </button>
      </span>
    ),
    { id: "shopify-reauth", duration: Infinity }
  );
};

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; reAuthUrl?: string }>) => {
    const data = error.response?.data;

    if (
      error.response?.status === 401 &&
      data?.error === "SHOPIFY_TOKEN_EXPIRED" &&
      data.reAuthUrl
    ) {
      if (isEmbedded) {
        if (!reAuthRedirectInFlight) {
          reAuthRedirectInFlight = true;
          window.open(data.reAuthUrl, "_top");
        }
      } else {
        // Standalone website: SHOPIFY_TOKEN_EXPIRED is returned both for a
        // genuinely expired token and for a store that was never connected at
        // all, and reAuthUrl points at OAuth — which isn't the recovery for a
        // store connected with its own custom-app credentials (and can't work
        // at all before the public app is approved). Send them to the connect
        // screen, which is the correct fix in both cases.
        promptShopifyReconnect();
      }
    }

    return Promise.reject(error);
  }
);
