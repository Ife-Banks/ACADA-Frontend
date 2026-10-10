import type { Metadata } from "next";
import { ProfileSummary } from "@/components/app/profile/ProfileSummary";
import { ChangePasswordForm } from "@/components/app/auth/ChangePasswordForm";

export const metadata: Metadata = { title: "My Profile" };

export default function MemberProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground mb-1">My Profile</h1>
        <p className="text-muted-foreground text-sm">
          Your personal details, cooperative memberships, and account security.
        </p>
      </header>

      <ProfileSummary />

      <section
        className="max-w-xl"
        style={{ animation: "var(--animate-fade-up)", animationDelay: "175ms" }}
      >
        <ChangePasswordForm />
      </section>
    </div>
  );
}