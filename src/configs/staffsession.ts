// Per-browser-session staff identity for the embedded (Shopify Admin) app.
//
// Shopify's App Bridge session token only proves "this is shop X" — it has no
// concept of individual eComProtect staff accounts, so a staff member opening
// the app from Shopify Admin would otherwise always resolve to the store
// owner. To let a staff member identify themselves, they sign in once per
// browser session (same email/password as the standalone site); the token
// better-auth's sign-in already returns in its response body is stored here
// and attached to every request as `x-staff-token` (see axios.config.tsx and
// resolveRequestUser in auth.middleware.ts), which takes priority over the
// shop-level App Bridge resolution.
//
// sessionStorage (not localStorage): cleared when the browser tab closes.
const STORAGE_KEY = "ecp_staff_session_token";

export const getStaffToken = (): string | null => {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStaffToken = (token: string): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // ignore — sessionStorage unavailable (e.g. privacy mode)
  }
};

export const clearStaffToken = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
