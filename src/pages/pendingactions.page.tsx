import { useEffect, useState } from "react";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { Clock } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useFetchPendingActions,
  type PendingRiskAction,
} from "@/hooks/orders/usefetchpendingactions";
import { useCancelPendingAction } from "@/hooks/orders/usecancelpendingaction";
import { getNotificationSocket } from "@/configs/socket.config";
import { useQueryClient } from "@tanstack/react-query";

const ACTION_LABELS: Record<PendingRiskAction["actionType"], string> = {
  hold: "Hold",
  auto_cancel: "Auto-Cancel",
};

const STATUS_STYLES: Record<PendingRiskAction["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  executed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled_by_staff: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled_by_contest: "bg-purple-100 text-purple-700 border-purple-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<PendingRiskAction["status"], string> = {
  pending: "Pending",
  executed: "Executed",
  cancelled_by_staff: "Cancelled by Staff",
  cancelled_by_contest: "Cancelled by Contest",
  failed: "Failed",
};

const orderNumber = (orderId: string) => orderId.replace(/^gid:\/\/shopify\/Order\//, "#");

function PendingActionsPage() {
  const [showHistory, setShowHistory] = useState(false);
  const { data, isLoading, isError } = useFetchPendingActions(showHistory);
  const { mutate: cancelAction, isPending: isCancelling } = useCancelPendingAction();
  const queryClient = useQueryClient();

  const [targetAction, setTargetAction] = useState<PendingRiskAction | null>(null);

  // Live update: a pending action can execute (scheduler) or get cancelled by
  // a customer contest while this page is open, independent of anything the
  // viewing staff member does.
  useEffect(() => {
    const socket = getNotificationSocket();

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["pending-actions"] });
    };

    socket.on("pending_action_updated", handleUpdate);
    return () => {
      socket.off("pending_action_updated", handleUpdate);
    };
  }, [queryClient]);

  const handleConfirmCancel = () => {
    if (!targetAction) return;
    cancelAction(targetAction.id, {
      onSuccess: () => setTargetAction(null),
    });
  };

  const rows = data ?? [];

  return (
    <Box className="rounded-lg bg-white p-6 shadow-sm">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Box>
          <h1 className="text-xl font-bold text-slate-800">Pending Actions</h1>
          <p className="text-sm text-slate-500">
            Automated holds/cancellations awaiting execution — stop any of
            these before they reach Shopify.
          </p>
        </Box>
        <Button
          variant="outline"
          className="border-slate-300 text-slate-700"
          onClick={() => setShowHistory((v) => !v)}
        >
          {showHistory ? "Show pending only" : "Show full history"}
        </Button>
      </header>

      {isLoading ? (
        <Box className="flex h-40 items-center justify-center text-slate-500">Loading…</Box>
      ) : isError ? (
        <Box className="flex h-40 items-center justify-center text-red-600">
          Failed to load pending actions.
        </Box>
      ) : rows.length === 0 ? (
        <Box className="flex h-60 flex-col items-center justify-center gap-2 text-center text-slate-500">
          <Clock className="h-10 w-10 text-slate-300" />
          <p className="text-lg font-medium">
            No orders are currently awaiting automated action
          </p>
        </Box>
      ) : (
        <Box className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-3 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Action</th>
                <th className="py-3 pr-4 font-medium">Reasons</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Scheduled For</th>
                <th className="py-3 pr-4 font-medium">Time Remaining</th>
                <th className="py-3 pr-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const due = new Date(row.scheduledFor);
                const overdue = row.status === "pending" && isPast(due);
                return (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-800">
                      {row.orderName || orderNumber(row.orderId)}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {row.customerName || "Unknown"}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {ACTION_LABELS[row.actionType]}
                    </td>
                    <td className="py-3 pr-4 max-w-xs text-slate-600">
                      {row.reasons && row.reasons.length > 0 ? (
                        <span className="line-clamp-2" title={row.reasons.join("; ")}>
                          {row.reasons.join("; ")}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className={STATUS_STYLES[row.status]}>
                        {STATUS_LABELS[row.status]}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-slate-600">
                      {format(due, "MMM dd, yyyy HH:mm")}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap text-slate-600">
                      {row.status === "pending" ? (
                        overdue ? (
                          <span className="text-orange-600">Due now</span>
                        ) : (
                          `in ${formatDistanceToNow(due)}`
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {row.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setTargetAction(row)}
                        >
                          Cancel Action
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}

      <Dialog open={!!targetAction} onOpenChange={(open) => !open && setTargetAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop this automated action?</DialogTitle>
            <DialogDescription>
              Are you sure you want to stop this automated action for Order{" "}
              {targetAction?.orderName || (targetAction ? orderNumber(targetAction.orderId) : "")}
              ? This cannot be undone — the order will need to be handled
              manually from here.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTargetAction(null)}>
              Keep Automation
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling…" : "Cancel Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default PendingActionsPage;
