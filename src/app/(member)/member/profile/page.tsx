import type { Metadata } from "next";
import { ProfileSummary } from "@/components/app/profile/ProfileSummary";
import { ChangePasswordForm } from "@/components/app/auth/ChangePasswordForm";

export const metadata: Metadata = { title: "My Profile" };

export default function MemberProfilePage() {
  return (
    <div className="member-page member-profile-page">
      <header className="member-page-heading">
        <div>
          <p className="member-page-eyebrow">Account</p>
          <h1>My profile</h1>
          <p>Your personal details, cooperative memberships, and account security.</p>
        </div>
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
