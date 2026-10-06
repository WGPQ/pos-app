import type { Metadata } from "next";
import OnboardingForm from "@/components/auth/OnboardingForm";
export const metadata: Metadata = { title: "Simplio POS | Crea tu negocio" };
export default function OnboardingPage() { return <OnboardingForm />; }
