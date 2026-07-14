import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export const useFetchPushSubscriptionStatus = (enabled: boolean) => {
  return useQuery<{ subscribed: boolean }>({
    queryKey: ["push-subscription-status"],
    queryFn: async () =>
      (await axios.get("/notifications/push-subscription/status")).data,
    enabled,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
};
