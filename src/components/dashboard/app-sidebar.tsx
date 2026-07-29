import {
  AlertCircle,
  ChevronDown,
  Clock,
  Globe,
  LayoutGrid,
  Loader2,
  PackagePlus,
  Paperclip,
  Settings,
  Store,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useFetchPendingActions } from "@/hooks/orders/usefetchpendingactions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import logo from "/images/logo_white.png";
import { IoMdLogOut } from "react-icons/io";
import { PiDotsNineBold } from "react-icons/pi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { authClient } from "../../providers/user.provider";
import { isEmbedded } from "@/configs/appbridge.config";
import { clearStaffToken } from "@/configs/staffsession";
import { toast } from "react-hot-toast";
import { FaUserPlus, FaStore } from "react-icons/fa6";
import whiteLogo from "/icons/logo_icon.png";
import React, { useState, useRef } from "react";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  subItems?: MenuItem[];
  badge?: number;
}

interface AppSidebarProps {
  role: "admin" | "user";
}

export function AppSidebar({ role }: AppSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  // State for expanded sidebar accordion
  const [openDropdown, setOpenDropdown] = useState("");

  // Only merchants (not superadmins) have pending risk actions of their own.
  const { data: pendingActions } = useFetchPendingActions(false, role === "user");
  const pendingActionsCount = pendingActions?.length ?? 0;

  const adminMainMenuItems: MenuItem[] = [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutGrid },
    {
      title: "Customer Management",
      url: "/admin/customer-management",
      icon: Users,
    },
    { title: "Store Management", url: "/admin/store-management", icon: Store },
  ];

  const adminSecondaryMenuItems: MenuItem[] = [
    {
      title: "Create Store",
      url: "/admin/create-store",
      icon: PackagePlus,
    },
    {
      title: "Reports",
      url: "/admin/report-analysis",
      icon: AlertCircle,
      subItems: [
        {
          title: "General Reports",
          url: "/admin/report-analysis",
          icon: AlertCircle,
        },
        {
          title: "Wide Network Report",
          url: "/admin/wide-network-report",
          icon: Globe,
        },
        {
          title: "Onboarding Report",
          url: "/admin/onboarding-report",
          icon: UserCheck,
        },
        {
          title: "System Effectiveness",
          url: "/admin/effectiveness-report",
          icon: TrendingUp,
        },
      ],
    },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const userMenuItems: MenuItem[] = [
    {
      title: "Customer Management",
      url: "/user/customer-management",
      icon: Users,
    },
    {
      title: "Pending Actions",
      url: "/user/pending-actions",
      icon: Clock,
      badge: pendingActionsCount,
    },
    {
      title: "Create Staff",
      url: "/user/create-staff",
      icon: FaUserPlus,
    },
    { title: "Notification", url: "/user/notification", icon: FaBell },
  ];

  const userSecondaryMenuItems: MenuItem[] = [
    { title: "Report", url: "/user/report", icon: Paperclip },
    { title: "Connect Shopify", url: "/user/connect-shopify", icon: FaStore },
    { title: "Settings", url: "/user/settings", icon: Settings },
  ];

  const { state } = useSidebar();

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      const hasSubItems = !!item.subItems;
      const isActivePath = pathname === item.url;
      const isSubItemActive = item.subItems?.some(
        (subItem) => pathname === subItem.url
      );
      const isParentActive = isActivePath || isSubItemActive;

      // Dropdown open control for expanded state
      const isExpandedDropdownOpen = hasSubItems && openDropdown === item.title;

      const Icon = item.icon;

      // --- LOGIC FOR COLLAPSED HOVER MENU ---
      if (state === "collapsed" && hasSubItems) {
        // We use a separate logic inside the map for the hover state of this specific item
        return (
          <HoverableSubMenu
            key={item.title}
            item={item}
            pathname={pathname}
            isParentActive={isParentActive || false}
          />
        );
      }

      // --- LOGIC FOR EXPANDED STATE (Or collapsed items with no children) ---
      const handleItemClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (hasSubItems && state === "expanded") {
          e.preventDefault();
          setOpenDropdown(isExpandedDropdownOpen ? "" : item.title);
        }
      };

      return (
        <React.Fragment key={item.title}>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isParentActive}
              tooltip={state === "collapsed" ? item.title : undefined}
              className={`hover:bg-gray-300 hover:text-black flex items-center gap-3 
            ${isParentActive ? "bg-white !text-black" : "text-white"}`}
            >
              <Link to={item.url} className="flex gap-3 w-full items-center" onClick={handleItemClick}>
                <Icon className="size-4 shrink-0" />
                <span className="block md:hidden ">{item.title}</span>
                {state === "expanded" && (
                  <>
                    <span className="hidden md:block flex-1 text-left">
                      {item.title}
                    </span>
                    {!!item.badge && (
                      <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                    {hasSubItems && (
                      <ChevronDown
                        className={`size-4 shrink-0 transition-transform ${isExpandedDropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </>
                )}
              </Link>
            </SidebarMenuButton>

            {/* Sub-Items for EXPANDED Sidebar */}
            {hasSubItems && isExpandedDropdownOpen && state === "expanded" && (
              <div className="pl-6 border-l border-blue-600 ml-4 py-1">
                {item.subItems!.map((subItem) => {
                  const isSubActive = pathname === subItem.url;
                  const SubIcon = subItem.icon;
                  return (
                    <SidebarMenuItem key={subItem.title} className="!p-0">
                      <SidebarMenuButton
                        asChild
                        isActive={isSubActive}
                        className={`hover:bg-gray-200 hover:text-black flex items-center gap-3 w-full justify-start !text-sm 
                          ${isSubActive
                            ? "bg-white !text-black"
                            : "text-white"
                          }`}
                      >
                        <Link to={subItem.url} className="flex gap-3 !py-2">
                          <SubIcon className="size-4 shrink-0" />
                          <span className="hidden md:block">
                            {subItem.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>
            )}
          </SidebarMenuItem>
        </React.Fragment>
      );
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Embedded (App Bridge) sessions are never cookie-based — every request
      // is authenticated independently via a fresh session token, so there's
      // no cookie session for better-auth's sign-out endpoint to invalidate.
      // Calling it here always 400s ("Failed to get session") and blocks the
      // rest of this function via the catch below.
      if (isEmbedded) {
        // No cookie session to sign out of — instead drop this browser
        // session's staff identity so EmbeddedStaffGate prompts again.
        clearStaffToken();
      } else {
        await authClient.signOut();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (isEmbedded) {
        window.location.reload();
        return;
      }

      if (role === "admin") {
        navigate("/admin-signin");
      } else {
        navigate("/signin");
      }
    } catch (error) {
      toast.error("Error logging out");
      console.error("Error logging out:", error);
      setIsLoading(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="bg-[#1E40AF] text-white ">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 mt-6">
          {state === "expanded" ? (
            <img src={logo} alt="eComProtect Logo" className="h-10" />
          ) : (
            <img src={whiteLogo} alt="eComProtect Logo Icon" className="h-4" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-auto">
        {role === "admin" ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-normal text-blue-300">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenuItems(adminMainMenuItems)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-2xl text-blue-300">
                <PiDotsNineBold />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderMenuItems(adminSecondaryMenuItems)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-normal text-blue-300">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenuItems(userMenuItems)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-xs font-normal text-blue-300">
                <PiDotsNineBold />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {renderMenuItems(userSecondaryMenuItems)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="bg-linear-to-r from-web-dark-red to-web-light-red py-5 cursor-pointer mb-4 text-white hover:bg-red-500 disabled:opacity-50"
              onClick={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <IoMdLogOut />
              )}
              {state === "expanded" && (
                <span>{isLoading ? "Logging out..." : "Logout"}</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// --- Helper Component for Hover Behavior ---
function HoverableSubMenu({
  item,
  pathname,
  isParentActive,
}: {
  item: MenuItem;
  pathname: string;
  isParentActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Open on enter, clear close timer
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  // Close on leave, but with a delay to allow moving to the menu
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms delay
  };

  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            isActive={isParentActive}
            className={`hover:bg-gray-300 hover:text-black flex items-center justify-center gap-3 
              ${isParentActive ? "bg-white !text-black" : "text-white"}`}
            // Apply mouse events to the Trigger
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Icon className="size-4 shrink-0" />
            <span className="sr-only">{item.title}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={5}
          className="bg-[#1E40AF] border-blue-600 text-white min-w-[200px] z-50 ml-2 shadow-xl"
          // Apply mouse events to the Content so it stays open when hovered
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="px-2 py-1.5 text-sm  font-semibold border-b border-blue-600 mb-1">
            {item.title}
          </div>
          {item.subItems!.map((subItem) => {
            const isSubActive = pathname === subItem.url;
            const SubIcon = subItem.icon;
            return (
              <DropdownMenuItem
                key={subItem.title}
                asChild
                className="focus:bg-blue-800 focus:text-white cursor-pointer"
              >
                <Link
                  to={subItem.url}
                  className={`flex items-center gap-2 w-full ${isSubActive ? "bg-white/10" : ""
                    }`}
                >
                  <SubIcon className="size-4 shrink-0" />
                  <span>{subItem.title}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}