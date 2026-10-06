import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Configuración" };

export default function ViewLayout({ children }: { children: ReactNode }) {
  return children;
}
