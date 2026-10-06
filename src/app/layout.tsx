import type { Metadata, Viewport } from "next";
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
  title: "Simplio POS",
  description: "Gestiona tu negocio con Simplio POS.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = { themeColor: "#8200DB" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
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
