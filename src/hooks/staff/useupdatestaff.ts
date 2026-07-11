import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { axios } from "../../configs/axios.config";

export type UpdateStaffPayload = {
  id: string;
  name?: string;
  mobile_number?: string;
  role?: string;
  banned?: boolean;
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateStaffPayload) =>
      axios.put(`/staff/${id}`, body),
    onSuccess: () => {
      toast.success("Staff member updated successfully");
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update staff member."
      );
    },
  });
};
