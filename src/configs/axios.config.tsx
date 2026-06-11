import ax, { AxiosError } from "axios";
import { fetchSessionToken, isEmbedded } from "./appbridge.config";

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
  }
  return config;
});
