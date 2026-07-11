import { useQuery } from "@tanstack/react-query";
import { axios, type ErrorWithMessage } from "../../configs/axios.config";

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  mobile_number: string | null;
  role: string;
  banned: boolean | null;
  emailVerified: boolean;
  createdAt: string;
};

export const useFetchStaff = () => {
  return useQuery<StaffMember[], ErrorWithMessage>({
    queryFn: async () => {
      const response = await axios.get("/staff");
      return response?.data.data ?? [];
    },
    queryKey: ["staff-list"],
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
