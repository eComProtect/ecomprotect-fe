import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";
import underline from "/images/underline_2.svg";
import { useRecentActivities } from "@/hooks/activity/usefetchactivity";

type ActivityItemProps = {
  icon: React.ElementType;
  iconClassName: string;
  children: React.ReactNode;
};

function ActivityItem({
  icon: Icon,
  iconClassName,
  children,
}: ActivityItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4">
      <Icon className={cn("h-5 w-5 flex-shrink-0", iconClassName)} />
      <p className="text-sm text-slate-700 truncate">{children}</p>
    </div>
  );
}

function EmptyStateMessage({ message }: { message: string }) {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

const MAX_ENTRIES_PER_COLUMN = 5;

export function RecentActivitySection() {
  // Fetch a larger pool than we display: the two columns split a single
  // combined feed by `for`, so a small combined limit lets one type (e.g.
  // frequent UPSERT_CUSTOMER activity) crowd out the other before either
  // column even gets to show its own 5.
  const { data: activities, isLoading, error } = useRecentActivities(50);

  const invoiceActivities =
    activities?.filter((a) => a.for === "customer").slice(0, MAX_ENTRIES_PER_COLUMN) ?? [];
  const retailerActivities =
    activities?.filter((a) => a.for === "store").slice(0, MAX_ENTRIES_PER_COLUMN) ?? [];

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Recent Customer Activities</CardTitle>
          <img src={underline} alt="" />{" "}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}

          {!isLoading && !error && invoiceActivities.length === 0 && (
            <EmptyStateMessage message="No recent customer activity." />
          )}

          {invoiceActivities.map((act) => (
            <ActivityItem
              key={act.id}
              icon={AlertTriangle}
              iconClassName="text-red-500"
            >
              {`${act.action} — ${
                act.meta?.reason ?? act.meta?.ip ?? act.customerId ?? ""
              }`}
            </ActivityItem>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 bg-white">
        <CardHeader className="w-full">
          <CardTitle className="text-lg">Recent Store Activities</CardTitle>
          <img src={underline} alt="" />{" "}
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}

          {!isLoading && !error && retailerActivities.length === 0 && (
            <EmptyStateMessage message="No recent store activity." />
          )}

          {retailerActivities.map((act) => (
            <ActivityItem
              key={act.id}
              icon={CheckCircle2}
              iconClassName="text-green-600"
            >
              {`${act.action} — Store ${act.storeId}`}
            </ActivityItem>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
