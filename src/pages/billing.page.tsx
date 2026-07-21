import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { axios } from "@/configs/axios.config";
import { getAppBridge, isEmbedded, host } from "@/configs/appbridge.config";
import { useIdentity } from "@/hooks/useidentity";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import logo from "/images/logo.png";

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

/**
 * Embedded plan-selection / billing page. Prices come from the backend
 * (GET /api/billing/plans, resolved for the merchant's order tier). Selecting a plan
 * creates a Shopify app subscription and redirects the TOP window to Shopify's
 * confirmation screen (App Bridge REMOTE — same iframe-breakout used for OAuth).
 */
const BillingPage = () => {
  const { user } = useIdentity();
  const [orders, setOrders] = useState<string>("0-300");
  const [selected, setSelected] = useState<MerchantPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Default the order range to whatever is already stored for this merchant.
  useEffect(() => {
    const stored = user?.average_orders_per_month;
    if (stored && ORDER_TIERS.some((t) => t.value === stored)) {
      setOrders(stored);
    }
  }, [user]);

  const { data: plans, isLoading } = useQuery<MerchantPlan[]>({
    queryKey: ["billing", "plans", orders],
    queryFn: async () =>
      (await axios.get(`/billing/plans?orders=${encodeURIComponent(orders)}`))
        .data?.data ?? [],
  });

  // Keep the selected plan's price in sync when the order range changes.
  useEffect(() => {
    if (!plans) return;
    setSelected(
      (prev) =>
        plans.find((p) => p.name === prev?.name) ??
        plans.find((p) => p.available) ??
        plans[0] ??
        null
    );
  }, [plans]);

  const formatPrice = (p: MerchantPlan) => {
    const symbol = p.currency === "GBP" ? "£" : p.currency === "EUR" ? "€" : "$";
    return `${symbol}${p.price}/mo`;
  };

  const handleSubscribe = async () => {
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

      const app = getAppBridge();
      if (isEmbedded && app) {
        // Break out of the Admin iframe to Shopify's billing confirmation screen.
        Redirect.create(app).dispatch(Redirect.Action.REMOTE, confirmationUrl);
      } else {
        window.location.href = confirmationUrl;
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to start checkout."
      );
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Flex className="min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading plans…</p>
      </Flex>
    );
  }

  return (
    <Flex className="mx-auto max-w-5xl flex-col p-8">
      <Box className="mb-6 w-32">
        <img src={logo} alt="eComProtect" />
      </Box>
      <Box className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#141414]">
          Pricing that scales with your growth
        </h1>
        <p className="mt-2 text-gray-600">
          Choose a plan to activate eComProtect for your store.
        </p>
      </Box>

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
        <p className="mt-1 text-xs text-gray-500">
          Pricing updates based on the orders you want to manage.
        </p>
      </Box>

      <Box className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => {
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
          onClick={handleSubscribe}
          disabled={!selected || !selected.available || submitting}
        >
          {submitting ? "Redirecting…" : "Proceed to Payment"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default BillingPage;
