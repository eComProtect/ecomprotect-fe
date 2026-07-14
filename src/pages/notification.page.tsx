// notificationsPage.tsx

import { ArrowUpDown } from "lucide-react";
import { cn } from "../lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Box } from "../components/ui/box";
import { Button } from "../components/ui/button";
import { Flex } from "../components/ui/flex";
import {
  ReportSummaryModal,
  type ReportData,
} from "../components/common/reportsummarymodal";
import { Dialog, DialogTrigger } from "../components/ui/dialog";
import { useFetchPushSubscriptionStatus } from "@/hooks/notifications/usefetchpushsubscriptionstatus";
import { useNotificationContext } from "@/providers/notification.provider";
import { shop } from "@/configs/appbridge.config";
import { Bell } from "lucide-react";

type RiskLevelText = "High" | "Medium" | "Low";

export interface NotificationMeta {
  orderId?: string;
  orderName?: string;
  reasons?: string[];
  totalAmount?: string;
  currency?: string;
  customerEmail?: string;
  ip?: string;
  location?: string;
  riskLevel?: string; // e.g. "100%" or "25%"
  detectedOn?: string;
}

export interface NotificationBackend {
  id: string;
  storeId: string;
  customerId: string | null;
  customerName: string | null;
  type: string;
  title: string;
  message: string;
  meta: NotificationMeta;
  read: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface NotificationUI {
  id: string;
  customerName: string;
  customerId: string;
  message: string;
  detectedAt: string;
  riskLevelPercent: number; // numeric, e.g. 100
  riskLevelText: RiskLevelText; // “High” / “Medium” / “Low”
  email: string;
  ipAddress: string;
  location: string;
  read?: boolean;
  detectedOn: string;
  flaggedBehaviors: string[];
  suggestedActions: string[];
}

const RiskBadge = ({ levelText }: { levelText: RiskLevelText }) => {
  const baseClass =
    "min-w-[120px] px-5 py-3 text-xs font-semibold rounded-md border-none";
  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-orange-100 text-orange-700",
    Low: "bg-[#3C9E0333] text-[#3C9E03]",
  };
  return (
    <Badge className={cn(baseClass, styles[levelText])}>{levelText} Risk</Badge>
  );
};

const NotificationItem = ({
  notification,
}: {
  notification: NotificationUI;
}) => {
  const report: ReportData = {
    name: notification.customerName,
    id: notification.customerId,
    email: notification.email,
    ipAddress: notification.ipAddress,
    location: notification.location,
    detectedOn: notification.detectedOn,
    riskLevel: notification.riskLevelPercent,
    flaggedBehaviors: notification.flaggedBehaviors,
    suggestedActions: notification.suggestedActions,
  };

  const { markAsSeen } = useNotificationContext();

  const handleClick = () => {
    if (!notification.read) {
      markAsSeen(notification.id);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Box
          onClick={handleClick}
          className={cn(
            "flex items-center justify-between gap-4 p-4 mb-4 rounded-xl shadow-sm transition-shadow duration-200 cursor-pointer",
            notification.read ? "bg-gray-50" : "bg-blue-50"
          )}
        >
          <div className="flex-1">
            <Flex className="items-center mb-2">
              <Avatar className="h-10 w-10 mr-3 shadow-md">
                <AvatarImage
                  src={""}
                  alt={notification.customerName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-200">
                  {notification.customerName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-bold text-slate-800">
                  {notification.customerName}
                </span>
                <span className="font-medium text-blue-600">
                  {" "}
                  (ID: {notification.customerId})
                </span>
              </div>
            </Flex>
            <Box>
              <p className="text-base font-semibold text-slate-900">
                {notification.message}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Detected on: {notification.detectedAt}
              </p>
            </Box>
          </div>
          <RiskBadge levelText={notification.riskLevelText} />
        </Box>
      </DialogTrigger>
      <ReportSummaryModal user={report} />
    </Dialog>
  );
};

function NotificationsPage() {
  // Backed by NotificationProvider, which stays live-updated via the
  // socket — using it here (instead of a separate fetch) is what makes new
  // notifications appear on this page without a reload.
  const { notifications: raw, isLoading, isError } = useNotificationContext();
  const { data: pushStatus } = useFetchPushSubscriptionStatus(!!shop);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }
  if (isError) {
    return <Box>Error loading notifications.</Box>;
  }

  const notifications: NotificationUI[] = raw.map((n) => {
    const meta = n.meta || {};

    // Parse risk level string into number
    let percent = 0;
    if (meta.riskLevel) {
      const cleaned = meta.riskLevel.toString().replace("%", "");
      const num = Number(cleaned);
      if (!isNaN(num)) {
        percent = num;
      }
    }

    // Determine text label
    let textLevel: RiskLevelText = "Low";
    if (percent >= 75) {
      textLevel = "High";
    } else if (percent >= 50) {
      textLevel = "Medium";
    }

    return {
      id: n.id,
      customerName: n.customerName ?? "Unknown",
      customerId: n.customerId ?? "",
      message: n.message,
      detectedAt: new Date(n.createdAt).toLocaleString(),
      riskLevelPercent: percent,
      riskLevelText: textLevel,
      email: meta.customerEmail ?? "",
      ipAddress: meta.ip ?? "",
      location: meta.location ?? "",
      detectedOn: meta.detectedOn ?? new Date(n.createdAt).toLocaleString(),
      flaggedBehaviors: meta.reasons ?? [],
      suggestedActions: [],
    };
  });

  return (
    <Box className="p-6 bg-white min-h-[90%]">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-web-dark-grey">Notifications</h1>
        <div className="flex items-center gap-2">
          {!pushStatus?.subscribed && (
            <Button
              variant="outline"
              className="text-slate-700 bg-white border-slate-300 hover:bg-slate-100"
              onClick={() =>
                window.open(
                  `/enable-notifications?shop=${encodeURIComponent(shop)}`,
                  "_blank"
                )
              }
            >
              <Bell className="mr-2 h-4 w-4" /> Enable push notifications
            </Button>
          )}
          {pushStatus?.subscribed && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <Bell className="h-4 w-4" /> Push enabled
            </span>
          )}
          <Button
            variant="outline"
            className="text-slate-700 bg-white border-slate-300 hover:bg-slate-100"
          >
            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort by
          </Button>
        </div>
      </header>
      <main>
        {notifications.length === 0 ? (
          <Box className="flex items-center justify-center h-[60vh] text-slate-500 text-lg font-medium">
            No notifications yet
          </Box>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))
        )}
      </main>
    </Box>
  );
}

export default NotificationsPage;
