import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export type ShopifyConnectionStatus = {
  connected: boolean;
  usesClientCredentials: boolean;
  shopUrl: string | null;
  clientIdPreview: string | null;
  expiresAt: string | null;
  /** Admin API scopes the merchant must enable on their custom app. Served by
   *  the API (from shopify.config.ts) rather than duplicated here, so the
   *  on-screen list always matches what the app actually requests. */
  requiredScopes: string[];
};

/** Shared so the page, the form and the gate modal all read one cached result
 *  and a successful connect invalidates every consumer at once. */
export const SHOPIFY_CONNECTION_QUERY_KEY = ["shopify", "credentials"];

export const useShopifyConnection = () =>
  useQuery<ShopifyConnectionStatus>({
    queryKey: SHOPIFY_CONNECTION_QUERY_KEY,
    queryFn: async () => (await axios.get("/shopify/credentials")).data,
    retry: false,
    staleTime: 60 * 1000,
  });
