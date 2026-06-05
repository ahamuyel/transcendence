import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/provider/theme";
import { AuthProvider } from "@/provider/auth";
import { PlatformBrandingProvider } from "@/provider/platform-branding";
import SessionGuard from "@/components/layout/SessionGuard";
import { getPlatformConfig } from "@/lib/platform-config";
import { getServerLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/provider/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let config
  try {
    config = await getPlatformConfig()
  } catch {
    config = { name: "Cur10usX", description: "Plataforma de gestão escolar" }
  }
  return {
    title: config.name,
    description: config.description || "Plataforma de gestão escolar",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LocaleProvider locale={locale}>
            <ThemeProvider>
              <PlatformBrandingProvider>
                <SessionGuard>{children}</SessionGuard>
              </PlatformBrandingProvider>
            </ThemeProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

