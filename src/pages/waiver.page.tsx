import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { axios } from "@/configs/axios.config";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WaiverInfo {
  orderName: string;
  storeName: string;
  reasons: string[];
  pendingStatus: string | null;
  scheduledFor: string | null;
}

/**
 * Public, customer-facing page — no login, no account. Access is gated
 * entirely by the signed token in the URL (see order.webhook.ts /
 * waiver.controller.ts), which is bound to this exact order.
 */
const WaiverPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [info, setInfo] = useState<WaiverInfo | null>(null);
  const [loadError, setLoadError] = useState("");
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!orderId || !token) {
      setLoadError("This link is missing required information.");
      return;
    }

    (async () => {
      try {
        const res = await axios.get(`/order/${orderId}/waiver-info`, { params: { token } });
        setInfo(res.data);
      } catch (e: any) {
        setLoadError(
          e?.response?.data?.message || "This link is invalid or has expired."
        );
      }
    })();
  }, [orderId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!explanation.trim()) {
      setSubmitError("Please add a brief explanation.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/order/${orderId}/contest`, { token, explanation });
      setSubmitted(true);
    } catch (e: any) {
      setSubmitError(
        e?.response?.data?.message || "Something went wrong submitting your response."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <Flex className="min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium text-gray-800">{loadError}</p>
      </Flex>
    );
  }

  if (!info) {
    return (
      <Flex className="min-h-screen flex-col items-center justify-center bg-white px-6">
        <p className="text-gray-500">Loading…</p>
      </Flex>
    );
  }

  if (submitted) {
    return (
      <Flex className="min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-medium text-gray-800">
          Thanks — your response has been sent to {info.storeName} for review.
        </p>
      </Flex>
    );
  }

  return (
    <Flex className="mx-auto min-h-screen max-w-xl flex-col justify-center p-8">
      <Box className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#141414]">
          Your order {info.orderName} needs a quick review
        </h1>
        <p className="mt-2 text-gray-600">
          {info.storeName} uses an automated fraud-screening system, and this
          order was flagged for a closer look.
        </p>
      </Box>

      {info.reasons.length > 0 && (
        <Box className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            What was flagged:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
            {info.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </Box>
      )}

      {info.pendingStatus && info.pendingStatus !== "pending" && (
        <p className="mb-4 text-sm text-gray-500">
          Note: an action has already been taken on this order. Submitting a
          response here will still notify the merchant for manual follow-up.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Label htmlFor="explanation">
          If you believe this was flagged in error, tell us why:
        </Label>
        <textarea
          id="explanation"
          rows={5}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="e.g. This is my regular shipping address, I've ordered from this store before..."
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        />
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <Button
          type="submit"
          className="w-full bg-blue-600 py-5 text-white hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit for Review"}
        </Button>
      </form>
    </Flex>
  );
};

export default WaiverPage;
