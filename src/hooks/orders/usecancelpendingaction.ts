import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/configs/axios.config";

export const useCancelPendingAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pendingActionId: string) =>
      (await axios.post("/order/cancel-pending-action", { pendingActionId })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-actions"] });
    },
  });
};
