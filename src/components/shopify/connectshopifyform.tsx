import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { axios, type ErrorWithMessage } from "@/configs/axios.config";
import {
  SHOPIFY_CONNECTION_QUERY_KEY,
  useShopifyConnection,
} from "@/hooks/useshopifyconnection";

type ConnectShopifyFormProps = {
  /** Called after the store is successfully connected — the modal uses this to
   *  close itself. */
  onConnected?: () => void;
  /** Hidden in the modal, where vertical space is tight. */
  showInstructions?: boolean;
};

/**
 * Credential entry for Shopify's client_credentials grant, shared by the
 * standalone page and the gate modal. The backend
 * (connectcredentials.controller.ts) verifies the pair against Shopify before
 * storing anything, so a bad Client ID/secret surfaces here as an error rather
 * than a broken connection later.
 */
export const ConnectShopifyForm = ({
  onConnected,
  showInstructions = true,
}: ConnectShopifyFormProps) => {
  const queryClient = useQueryClient();
  const { data: statusData } = useShopifyConnection();

  const [form, setForm] = useState({
    shopUrl: "",
    clientId: "",
    clientSecret: "",
  });

  // Prefill the store URL from whatever the account already has (set at
  // signup), so the usual case is two fields, not three.
  useEffect(() => {
    if (statusData?.shopUrl && !form.shopUrl) {
      setForm((prev) => ({ ...prev, shopUrl: statusData.shopUrl! }));
    }
  }, [statusData?.shopUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const scopes = statusData?.requiredScopes ?? [];
  const [copied, setCopied] = useState(false);

  // The dev dashboard takes scopes as a comma-separated list, so copy them in
  // exactly that shape rather than making the merchant retype thirty of them.
  const copyScopes = async () => {
    try {
      await navigator.clipboard.writeText(scopes.join(","));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select and copy the scopes manually.");
    }
  };

  const { mutate: connect, isPending } = useMutation({
    mutationFn: async () =>
      (
        await axios.post("/shopify/credentials", {
          shopUrl: form.shopUrl.trim(),
          clientId: form.clientId.trim(),
          clientSecret: form.clientSecret.trim(),
        })
      ).data as { webhooksRegistered: boolean },
    onSuccess: (data) => {
      toast.success("Store connected to Shopify.");
      if (!data.webhooksRegistered) {
        toast.error(
          "Connected, but some Shopify webhooks could not be registered. Order events may be delayed."
        );
      }
      // Drop the secret from component state the moment it's no longer needed.
      setForm((prev) => ({ ...prev, clientSecret: "" }));
      queryClient.invalidateQueries({ queryKey: SHOPIFY_CONNECTION_QUERY_KEY });
      // Store data hooks failed while unconnected — let them refetch now.
      queryClient.invalidateQueries({ queryKey: ["identity"] });
      onConnected?.();
    },
    onError: (error: ErrorWithMessage) => {
      toast.error(
        error.response?.data?.message ?? "Could not connect the store."
      );
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.shopUrl.includes(".myshopify.com")) {
      toast.error("Store URL must be in the form storename.myshopify.com");
      return;
    }
    if (!form.clientId.trim() || !form.clientSecret.trim()) {
      toast.error("Both Client ID and Client secret are required.");
      return;
    }

    connect();
  };

  return (
    <Box className="space-y-5">
      {showInstructions && (
        <Box className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-semibold">Where to find these</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              In your Shopify admin, go to <b>Settings → Apps → Developer Apps</b>, then click <b>Build apps in dev dashboard</b> — this opens the
              Shopify dev dashboard.
            </li>
            <li>
              Create an app there and while doing so enter{" "}
              <b>https://ecomprotect.co.uk</b> as App URL and give it the API
              scopes listed below.
            </li>
            <li>
              <b>Install the app on your store.</b> Credentials from an
              uninstalled app are rejected.
            </li>
            <li>
              Open the app's <b>Settings</b> (Client credentials) tab and
              copy the <b>Client ID</b> and <b>Client secret</b>.
            </li>
          </ol>

          <Box className="space-y-2 rounded-md border border-gray-200 bg-white p-3">
            <Flex className="items-center justify-between gap-2">
              <p className="font-semibold">
                Required scopes{scopes.length ? ` (${scopes.length})` : ""}
              </p>
              <Button
                type="button"
                variant="ghost"
                className="h-auto px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                onClick={copyScopes}
                disabled={!scopes.length}
              >
                {copied ? "Copied" : "Copy all"}
              </Button>
            </Flex>
            {scopes.length ? (
              <Flex className="flex-wrap gap-1.5">
                {scopes.map((scope) => (
                  <code
                    key={scope}
                    className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800"
                  >
                    {scope}
                  </code>
                ))}
              </Flex>
            ) : (
              <p className="text-xs text-gray-500">
                Could not load the scope list — reload the page.
              </p>
            )}
            <p className="text-xs text-gray-500">
              Missing a scope doesn't always error: Shopify can return empty
              results instead, so enable all of them.
            </p>
          </Box>
        </Box>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Box className="space-y-1">
          <label className="text-sm font-medium">Store URL</label>
          <Input
            name="shopUrl"
            value={form.shopUrl}
            onChange={handleChange}
            placeholder="storename.myshopify.com"
            autoComplete="off"
          />
        </Box>

        <Box className="space-y-1">
          <label className="text-sm font-medium">Client ID</label>
          <Input
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            placeholder={statusData?.clientIdPreview ?? "Client ID"}
            autoComplete="off"
          />
        </Box>

        <Box className="space-y-1">
          <label className="text-sm font-medium">Client secret</label>
          <Input
            name="clientSecret"
            type="password"
            value={form.clientSecret}
            onChange={handleChange}
            placeholder="shpss_..."
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500">
            Stored encrypted and never shown again. Re-enter it to reconnect if
            you rotate it in Shopify.
          </p>
        </Box>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 py-6 text-base text-white hover:bg-blue-700"
        >
          {isPending ? (
            <Spinner />
          ) : statusData?.connected ? (
            "Update connection"
          ) : (
            "Connect store"
          )}
        </Button>
      </form>
    </Box>
  );
};
