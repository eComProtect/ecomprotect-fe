import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ConnectShopifyForm } from "@/components/shopify/connectshopifyform";
import { useShopifyConnection } from "@/hooks/useshopifyconnection";

/**
 * Full-page version of the Shopify credential form (the same form also appears
 * as a modal from anywhere in the dashboard — see connectshopifymodal.tsx).
 * This is the page to link to from settings, and where the modal sends anyone
 * who needs the step-by-step instructions.
 */
export default function ConnectShopify() {
  const { data: statusData, isLoading } = useShopifyConnection();

  if (isLoading) {
    return (
      <Flex className="w-full justify-center py-20">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box className="mx-auto w-full max-w-2xl space-y-4">
      <Card className="!bg-white">
        <CardHeader>
          <CardTitle>Connect your Shopify store</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {statusData?.connected && (
            <Box className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Connected
              {statusData.shopUrl ? ` to ${statusData.shopUrl}` : ""}
              {statusData.clientIdPreview
                ? ` · Client ID ${statusData.clientIdPreview}`
                : ""}
              {statusData.usesClientCredentials
                ? " · access renews automatically"
                : " · connected via app install"}
            </Box>
          )}

          <ConnectShopifyForm />
        </CardContent>
      </Card>
    </Box>
  );
}
