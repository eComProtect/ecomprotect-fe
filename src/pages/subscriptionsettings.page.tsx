import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { host } from "@/configs/appbridge.config";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

// Values must match the backend pricing matrix keys (billing.util.ts).
const ORDER_TIERS: { value: string; label: string }[] = [
  { value: "0-300", label: "0 – 300" },
  { value: "301-2,000", label: "301 – 2,000" },
  { value: "2,001-5,000", label: "2,001 – 5,000" },
  { value: "5000+", label: "5,000+" },
];

interface MerchantPlan {
  name: string;
  description: string;
  features: string[];
  price: number;
  currency: string;
  available: boolean;
}

interface ActiveSubscription {
  id: string;
  name: string;
  status: string;
  test: boolean;
}

interface BillingStatus {
  active: boolean;
  subscriptions: ActiveSubscription[];
}

interface OrderQuota {
  count: number;
  cap: number | null;
  tier: string | null;
}

/**
 * Manage-subscription page for merchants who are already active (unlike
 * billing.page.tsx, which only runs once during initial onboarding). Lets a
 * merchant switch plans — appSubscriptionCreate's default replacementBehavior
 * (STANDARD) handles cancelling the old subscription and starting the new one
 * once approved, so this reuses the same POST /billing/subscribe endpoint —
 * or cancel outright via POST /billing/cancel.
 *
 * Cancelling doesn't lock the merchant out immediately: Shopify confirms the
 * cancellation asynchronously via the app/subscriptions-update webhook
 * (subscription.webhook.ts), which is what actually flips onboardingStatus
 * away from "active" — at that point every data endpoint (orders, customers,
 * reports, ...) starts 403'ing via requireActiveOnboarding until the
 * merchant re-subscribes.
 */
const SubscriptionSettingsPage = () => {
  const queryClient = useQueryClient();
  const [orders, setOrders] = useState<string>("0-300");
  const [selected, setSelected] = useState<MerchantPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [error, setError] = useState("");

  const { data: billingStatus, isLoading: statusLoading } =
    useQuery<BillingStatus>({
      queryKey: ["billing", "status"],
      queryFn: async () => (await axios.get("/billing/status")).data,
    });

  const currentSubscription = billingStatus?.subscriptions?.find(
    (s) => s.status === "ACTIVE"
  );

  const { data: quota } = useQuery<OrderQuota>({
    queryKey: ["billing", "quota"],
    queryFn: async () => (await axios.get("/billing/quota")).data,
  });

  const { data: plans, isLoading: plansLoading } = useQuery<MerchantPlan[]>({
    queryKey: ["billing", "plans", orders],
    queryFn: async () =>
      (await axios.get(`/billing/plans?orders=${encodeURIComponent(orders)}`))
        .data?.data ?? [],
  });

  const formatPrice = (p: MerchantPlan) => {
    const symbol = p.currency === "GBP" ? "£" : p.currency === "EUR" ? "€" : "$";
    return `${symbol}${p.price}/mo`;
  };

  const handleChangePlan = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post("/billing/subscribe", {
        package: selected.name,
        orders,
        host,
      });
      const confirmationUrl: string | undefined = res.data?.confirmationUrl;
      if (!confirmationUrl) throw new Error("No confirmation URL returned.");
      // See billing.page.tsx for why this uses top.location.href instead of
      // window.open("_top") — popup blocker eats the latter after an await.
      (window.top ?? window).location.href = confirmationUrl;
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to start checkout."
      );
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await axios.post("/billing/cancel");
      toast.success(
        "Cancellation requested. You'll lose access to new data once Shopify confirms it."
      );
      setConfirmCancelOpen(false);
      queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to cancel subscription."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (statusLoading || plansLoading) {
    return (
      <Flex className="min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading subscription…</p>
      </Flex>
    );
  }

  return (
    <Flex className="mx-auto max-w-5xl flex-col p-8">
      <Box className="mb-8">
        <h1 className="text-3xl font-bold text-[#141414]">Manage Subscription</h1>
        <p className="mt-2 text-gray-600">
          {currentSubscription
            ? `You're currently on ${currentSubscription.name}.`
            : "You don't have an active subscription."}
        </p>
      </Box>

      {currentSubscription && (
        <Box className="mb-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
          <Box>
            <p className="text-sm font-medium text-gray-500">Current plan</p>
            <p className="text-lg font-semibold">{currentSubscription.name}</p>
          </Box>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setConfirmCancelOpen(true)}
          >
            Cancel Subscription
          </Button>
        </Box>
      )}

      {quota && (
        <Box className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <Flex className="items-baseline justify-between">
            <p className="text-sm font-medium text-gray-500">
              Orders analyzed this month
            </p>
            <p className="text-sm font-semibold">
              {quota.count}
              {quota.cap !== null ? ` / ${quota.cap}` : " (unlimited)"}
            </p>
          </Flex>
          {quota.cap !== null && (
            <Box className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <Box
                className={[
                  "h-full rounded-full",
                  quota.count >= quota.cap ? "bg-red-500" : "bg-blue-600",
                ].join(" ")}
                style={{
                  width: `${Math.min(100, (quota.count / quota.cap) * 100)}%`,
                }}
              />
            </Box>
          )}
          {quota.cap !== null && quota.count >= quota.cap && (
            <p className="mt-2 text-xs text-red-600">
              You've reached this month's limit — new orders won't be
              screened for risk until next month, or upgrade to a higher
              order-volume tier below for higher coverage right away.
            </p>
          )}
        </Box>
      )}

      <Box className="mx-auto mb-8 w-full max-w-xs">
        <label
          htmlFor="orders"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Average orders per month
        </label>
        <select
          id="orders"
          value={orders}
          onChange={(e) => setOrders(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          {ORDER_TIERS.map((tier) => (
            <option key={tier.value} value={tier.value}>
              {tier.label}
            </option>
          ))}
        </select>
      </Box>

      <Box className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => {
          const isCurrent = currentSubscription?.name === plan.name;
          const isSelected = selected?.name === plan.name;
          return (
            <button
              key={plan.name}
              type="button"
              disabled={!plan.available}
              onClick={() => plan.available && setSelected(plan)}
              className={[
                "rounded-2xl border p-6 text-left transition",
                isSelected
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600"
                  : "border-gray-200 bg-white hover:border-gray-300",
                !plan.available ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              <Flex className="items-baseline justify-between">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <span className="text-sm font-medium text-gray-500">
                  {formatPrice(plan)}
                </span>
              </Flex>
              {isCurrent && (
                <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Current plan
                </span>
              )}
              <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {!plan.available && (
                <p className="mt-3 text-xs font-medium text-gray-400">
                  Contact sales
                </p>
              )}
            </button>
          );
        })}
      </Box>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <Flex className="mt-8 justify-end">
        <Button
          className="bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
          onClick={handleChangePlan}
          disabled={
            !selected ||
            !selected.available ||
            selected.name === currentSubscription?.name ||
            submitting
          }
        >
          {submitting ? "Redirecting…" : "Change Plan"}
        </Button>
      </Flex>

      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cancel your subscription?
            </DialogTitle>
            <DialogDescription>
              Once Shopify confirms the cancellation, you'll immediately lose
              access to new customer and order data — orders, customers,
              reports, and notifications will stop updating until you
              re-subscribe. This can't be undone from here; you'd need to
              resubscribe to restore access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmCancelOpen(false)}
              disabled={cancelling}
            >
              Keep Subscription
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling…" : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Flex>
  );
};

export default SubscriptionSettingsPage;
