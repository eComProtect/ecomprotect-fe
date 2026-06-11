import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/providers/user.provider";
import { axios } from "@/configs/axios.config";
import { isEmbedded } from "@/configs/appbridge.config";

export interface Identity {
  // Shape differs slightly by mode (DB row vs better-auth user), but both expose the
  // fields the UI reads (email, image, role, package, plan, shopify_url, ...).
  user: Record<string, any> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Single source of truth for "who is the current user", working in both modes:
 *  - Embedded in Shopify Admin → resolved from GET /user/me using the App Bridge
 *    session token (third-party cookies are blocked inside the iframe).
 *  - Standalone site            → resolved from the better-auth cookie session.
 *
 * Both hooks are always called (rules of hooks); we just pick which result to return.
 */
export const useIdentity = (): Identity => {
  const { data: sessionData, isPending } = authClient.useSession();

  const {
    data: meData,
    isLoading: meLoading,
    isError,
  } = useQuery({
    queryKey: ["identity", "me"],
    queryFn: async () => (await axios.get("/user/me")).data?.data,
    enabled: isEmbedded,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isEmbedded) {
    return {
      user: meData ?? null,
      isAuthenticated: !!meData && !isError,
      isLoading: meLoading,
    };
  }

  return {
    user: (sessionData?.user as Record<string, any>) ?? null,
    isAuthenticated: !!sessionData?.session?.token,
    isLoading: isPending,
  };
};
