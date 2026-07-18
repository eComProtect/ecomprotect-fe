import { useState, type ReactNode } from "react";
import { isEmbedded } from "@/configs/appbridge.config";
import { getStaffToken } from "@/configs/staffsession";
import { EmbeddedStaffIdentifyForm } from "@/components/authform/embeddedstaffidentify.form";

/**
 * Gates merchant-facing routes behind a one-time-per-browser-session staff
 * login when running embedded in Shopify Admin. See staffsession.ts for why:
 * the App Bridge token alone can't tell staff members apart from the owner.
 * A no-op outside the embedded context (standalone cookie login already
 * identifies the user correctly).
 */
export function EmbeddedStaffGate({ children }: { children: ReactNode }) {
  const [identified, setIdentified] = useState(() => !isEmbedded || Boolean(getStaffToken()));

  if (!isEmbedded || identified) {
    return <>{children}</>;
  }

  return <EmbeddedStaffIdentifyForm onIdentified={() => setIdentified(true)} />;
}
