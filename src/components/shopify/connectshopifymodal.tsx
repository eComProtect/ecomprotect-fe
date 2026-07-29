import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { useShopifyConnection } from "@/hooks/useshopifyconnection";
import { useIdentity } from "@/hooks/useidentity";
import { ConnectShopifyForm } from "./connectshopifyform";

const CONNECT_PATH = "/user/connect-shopify";

/**
 * Prompts for Shopify credentials as soon as a merchant lands anywhere in the
 * dashboard without a connected store — until then every store-data hook comes
 * back empty, with nothing on screen explaining why.
 *
 * Mounted once in the merchant Layout rather than per page. Deliberately not
 * hard-blocking: it can be dismissed for the current view (billing, settings
 * and staff pages are all still worth reaching unconnected) but returns on the
 * next page load, and outside-click/Escape don't dismiss it so it can't be
 * closed by accident.
 */
export const ConnectShopifyModal = () => {
  const { pathname } = useLocation();
  const { user } = useIdentity();
  const { data, isLoading } = useShopifyConnection();
  const [dismissed, setDismissed] = useState(false);

  // Staff rows point at the owner row that holds the store's Shopify
  // connection; only that owner can change it (the backend enforces this too).
  const isOwner = !user?.storeOwnerId;

  const open =
    !isLoading &&
    data?.connected === false &&
    !dismissed &&
    pathname !== CONNECT_PATH;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <DialogContent
        className="sm:max-w-xl bg-white border border-gray-200 p-6 shadow-lg"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Connect your Shopify store</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Orders, customers and risk checks stay empty until this store is connected to Shopify."
              : "This store isn't connected to Shopify yet, so no order or customer data will load."}
          </DialogDescription>
        </DialogHeader>

        {isOwner ? (
          <>
            <ConnectShopifyForm
              showInstructions={false}
              onConnected={() => setDismissed(true)}
            />
            <Box className="flex items-center justify-between text-sm">
              <Link
                to={CONNECT_PATH}
                className="text-blue-600 hover:underline"
                onClick={() => setDismissed(true)}
              >
                Where do I find these?
              </Link>
              <Button
                variant="ghost"
                className="text-gray-500"
                onClick={() => setDismissed(true)}
              >
                Do this later
              </Button>
            </Box>
          </>
        ) : (
          <Box className="space-y-4">
            <p className="text-sm text-gray-600">
              Ask the store owner to connect it from Settings → Connect Shopify.
            </p>
            <Button
              className="w-full bg-blue-600 py-6 text-white hover:bg-blue-700"
              onClick={() => setDismissed(true)}
            >
              Continue anyway
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
