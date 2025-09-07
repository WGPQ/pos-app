import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import TooltipProvider from "@/context/TooltipProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import Providers from "@/context/QueryClientProvider";
import { SidebarProvider } from "@/context/SidebarContext";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ely Papelería",
  description: "Tu tienda en línea de papelería y artículos de oficina",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.className} dark:bg-gray-900`}
      >
        <ThemeProvider>
          <TooltipProvider>
            <Providers>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </Providers>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
