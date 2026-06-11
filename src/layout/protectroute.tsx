import { Navigate } from "react-router-dom";
import { authClient } from "@/providers/user.provider";
import { useIdentity } from "@/hooks/useidentity";
import { isEmbedded, shop } from "@/configs/appbridge.config";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useIdentity();

  if (isLoading) return null;

  if (!isAuthenticated) {
    // Embedded merchants have no cookie session; an unauthenticated state inside the
    // iframe means the shop isn't installed (or the token was revoked) → re-run OAuth.
    if (isEmbedded) {
      window.location.replace(`/install?shop=${encodeURIComponent(shop)}`);
      return null;
    }
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

// Only for public pages like /signin
export const PublicOnlyRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isPending } = authClient.useSession();

  if (isPending) return null;

  if (data?.session?.token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};