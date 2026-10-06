import type { Metadata } from "next";
import PasswordRecoveryForm from "@/components/PasswordRecoveryForm";

export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <PasswordRecoveryForm token={typeof token === "string" ? token : ""} />;
}
