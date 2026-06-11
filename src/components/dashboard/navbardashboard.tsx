import { Bell, Settings, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Box } from "../ui/box";
import icon from "/icons/logo_icon.png";
import waveIcon from "/icons/wave_icon.svg";
import { useIdentity } from "@/hooks/useidentity";
import { useNotificationContext } from "@/providers/notification.provider";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { axios } from "@/configs/axios.config";

interface NavbarDashboardProps {
  userType: "admin" | "user";
}

const SEARCH_TYPES = [
  { value: "all", label: "All Fields" },
  { value: "firstName", label: "First Name" },
  { value: "surname", label: "Surname" },
  { value: "address", label: "Address" },
  { value: "postCode", label: "Post Code" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
];

export const NavbarDashboard = ({ userType }: NavbarDashboardProps) => {
  const { user } = useIdentity();
  const { unreadCount } = useNotificationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const [searchType, setSearchType] = useState(
    searchParams.get("searchType") || "all"
  );

  const prevSearchValue = useRef(searchValue);

  const welcomeMessage =
    userType === "admin"
      ? "Welcome to, Admin Panel"
      : "Welcome to the Dashboard";

  const allowedPaths = [
    "/user/customer-management",
    "/admin/customer-management",
    "/admin/store-management",
  ];

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (allowedPaths.includes(location.pathname)) {
        const queryParams = new URLSearchParams();
        if (searchValue) queryParams.set("search", searchValue);
        if (searchType !== "all") queryParams.set("searchType", searchType);

        const newUrl = `${location.pathname}${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        navigate(newUrl, { replace: true });

        // Increment search count on the backend if the search value has actually changed and is not empty
        if (searchValue && searchValue !== prevSearchValue.current) {
          try {
            await axios.put("/user/increment-searches", {});
            prevSearchValue.current = searchValue;
          } catch (error) {
            console.error("Failed to increment search count", error);
          }
        }
      }
    }, 500); // Increased debounce to 500ms for tracking purposes

    return () => clearTimeout(timeout);
  }, [searchValue, searchType, location.pathname, navigate]);

  return (
    <header className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm bg-white max-sm:flex-col max-sm:items-start max-sm:space-y-3 ">
      <div>
        <Box className="flex gap-x-2 items-center">
          <h1 className="text-lg font-semibold">{welcomeMessage}</h1>
          <img src={waveIcon} alt="wave-icon" className="w-6 h-6" />
        </Box>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>

      {allowedPaths.includes(location.pathname) && (
        <div className="flex items-center gap-0 relative w-full max-w-xl mx-4 max-sm:mx-1 border border-web-grey rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <div className="flex-shrink-0 border-r border-web-grey bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0 focus:ring-offset-0 h-10 px-3 text-xs font-medium text-slate-600">
                <SelectValue placeholder="Search Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl">
                {SEARCH_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs hover:bg-slate-50 cursor-pointer">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1">
            <Search
              className="absolute text-web-grey left-3 top-1/2 -translate-y-1/2 opacity-40"
              size={18}
            />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Search by ${SEARCH_TYPES.find(t => t.value === searchType)?.label.toLowerCase() || 'all fields'}...`}
              className="w-full pl-10 border-0 focus-visible:ring-0 h-10 text-sm bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Right side: Action Icons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
          className="bg-gray-100 rounded-full p-2 cursor-pointer transition-transform hover:scale-110"
          onClick={() => {
            if (userType === "admin") {
              navigate("/admin/settings");
            } else {
              navigate("/user/settings");
            }
          }}
        >
          <Settings className="size-5" />
        </Button>

        {userType === "user" && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="bg-gray-100 rounded-full p-2 relative transition-transform hover:scale-110"
          >
            <Link to="/user/notification">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </Link>
          </Button>
        )}

        <Button
          size="icon"
          aria-label="App"
          className="bg-blue-600 hover:bg-blue-700 rounded-full p-0.5 border-2 border-transparent hover:border-blue-200 transition-all shadow-md active:scale-95"
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
            <img
                src={user?.image || icon}
                alt="Profile"
                className="w-full h-full object-cover"
            />
          </div>
        </Button>
      </div>
    </header>
  );
};
