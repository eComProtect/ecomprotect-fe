import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

interface SubscriptionStatus {
  active: boolean;
  subscriptions: Array<{ id: string; name: string; status: string; test: boolean }>;
}

/**
 * Live app-subscription status from Shopify (via GET /api/billing/status).
 * Used to gate access to the dashboard for embedded merchants.
 */
export const useSubscription = () => {
  const { data, isLoading, isError, refetch } = useQuery<SubscriptionStatus>({
    queryKey: ["billing", "status"],
    queryFn: async () => (await axios.get("/billing/status")).data,
    retry: false,
    staleTime: 60 * 1000,
  });

  return {
    active: data?.active ?? false,
    subscriptions: data?.subscriptions ?? [],
    isLoading,
    isError,
    refetch,
  };
};
