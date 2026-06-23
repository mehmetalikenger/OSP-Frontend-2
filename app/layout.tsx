import type { Metadata } from "next";
import { Oxanium, Open_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-oxanium",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "OSP",
  description: "OffiTec HVAC Selection Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDark = (await cookies()).get("theme")?.value === "dark";
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body
        className={`${oxanium.variable} ${openSans.variable} ${openSans.className} min-h-full flex flex-col${isDark ? " dark-mode" : ""}`}
        style={isDark ? { backgroundColor: "#1b1b1b" } : undefined}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
