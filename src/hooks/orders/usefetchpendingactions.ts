import { useQuery } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export interface PendingRiskAction {
  id: string;
  orderId: string;
  orderName: string | null;
  customerId: string | null;
  customerName: string | null;
  actionType: "hold" | "auto_cancel";
  status: "pending" | "executed" | "cancelled_by_staff" | "cancelled_by_contest" | "failed";
  reasons: string[] | null;
  scheduledFor: string;
  executedAt: string | null;
  createdAt: string | null;
}

export const useFetchPendingActions = (includeHistory: boolean, enabled = true) => {
  return useQuery<PendingRiskAction[]>({
    queryKey: ["pending-actions", includeHistory],
    queryFn: async () =>
      (
        await axios.get("/order/pending-actions", {
          params: includeHistory ? { includeHistory: "true" } : undefined,
        })
      ).data.data,
    staleTime: 30 * 1000,
    enabled,
  });
};
