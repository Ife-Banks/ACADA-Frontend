import type { Metadata } from "next";
import { SocietySettingsView } from "@/components/app/settings/SocietySettingsView";
import { RoleGate } from "@/components/app/shared/RoleGate";

export const metadata: Metadata = { title: "Society Settings" };

export default function SocietySettingsPage() {
  /* Society settings are the society admin's. The route prefix already
     restricts this page; the gate is the second lock. */
  return (
    <RoleGate allow={["SOCIETY_ADMIN"]}>
      <SocietySettingsView />
    </RoleGate>
  );
}
