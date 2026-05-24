import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto_Condensed, Syncopate, Orbitron, Anta, Exo_2, Oxanium, Open_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-roboto-condensed",
});

const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
});

const anta = Anta({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anta",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-exo2",
});

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
  title: "OffiTec SP",
  description: "OffiTec HVAC Selection Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className={`${plusJakartaSans.className} ${robotoCondensed.variable} ${plusJakartaSans.variable} ${syncopate.variable} ${orbitron.variable} ${anta.variable} ${exo2.variable} ${oxanium.variable} ${openSans.variable} min-h-full flex flex-col`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
