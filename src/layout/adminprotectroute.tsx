import { Flex } from "@/components/ui/flex";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/providers/user.provider";
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

type StaffProtectedRouteProps = {
  children: ReactNode;
};

export const AdminProtectedRoute = ({ children }: StaffProtectedRouteProps) => {
  // Reads the reactive session store rather than a one-shot getSession() in an
  // effect. The effect version latched whatever that first call returned (empty
  // dep array, no retry, any failure read as "no access"), so a session that
  // resolved a moment later could never un-stick the redirect to /admin-signin.
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Flex className="w-full h-[100vh] justify-center items-center">
        <Spinner />
      </Flex>
    );
  }

  if ((session?.user as { role?: string } | undefined)?.role !== "superadmin") {
    return <Navigate to="/admin-signin" replace />;
  }

  return <>{children}</>;
};

type PublicAdminRouteProps = {
  children: ReactNode;
};

export const PublicAdminRoute = ({ children }: PublicAdminRouteProps) => {
  // Same reasoning as AdminProtectedRoute above — reactive store, not a latched
  // one-shot check.
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <Flex className="w-full h-[100vh] justify-center items-center">
        <Spinner />
      </Flex>
    );
  }

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  if (userRole === "user" || userRole === "sub-admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
