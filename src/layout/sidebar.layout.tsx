import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/dashboard/app-sidebar";
import { NavbarDashboard } from "../components/dashboard/navbardashboard";
import { useLocation } from "react-router-dom";
import { EmbeddedStaffGate } from "./embeddedstaffgate";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const userType = pathname.startsWith("/admin") ? "admin" : "user";

  // Platform-admin routes aren't store-embedded, so the staff-identity gate
  // (which is a no-op outside Shopify Admin anyway) only wraps merchant routes.
  const content =
    userType === "user" ? (
      <EmbeddedStaffGate>{children}</EmbeddedStaffGate>
    ) : (
      children
    );

  return (
    <SidebarProvider>
      <AppSidebar role={userType} />
      <div className="flex flex-1 flex-col p-4 bg-web-grey overflow-x-hidden">
        <header className="flex items-center justify-between">
          <SidebarTrigger />
        </header>

        <NavbarDashboard userType={userType} />

        <main className="mt-4 flex-1">{content}</main>
      </div>
    </SidebarProvider>
  );
}
