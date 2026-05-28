import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/provider/theme";
import { AuthProvider } from "@/provider/auth";
import { PlatformBrandingProvider } from "@/provider/platform-branding";
import SessionGuard from "@/components/layout/SessionGuard";
import { getPlatformConfig } from "@/lib/platform-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPlatformConfig();
  return {
    title: config.name,
    description: config.description || "Plataforma de gestão escolar",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <PlatformBrandingProvider>
              <SessionGuard>{children}</SessionGuard>
            </PlatformBrandingProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
