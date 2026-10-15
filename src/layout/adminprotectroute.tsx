import { Flex } from "@/components/ui/flex";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/providers/user.provider";
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

// Every role that signs in through /admin-signin and should land in the
// /admin/* dashboard area — platform staff (Platform Admin, IT Support,
// Project Manager) alongside superadmin. Keep in sync with
// shopify-be/src/utils/staffroles.util.ts PLATFORM_STAFF_ROLES.
const PLATFORM_DASHBOARD_ROLES = [
  "superadmin",
  "admin",
  "it_support",
  "project_manager",
];

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

  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!role || !PLATFORM_DASHBOARD_ROLES.includes(role)) {
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
