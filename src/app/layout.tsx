import type { Metadata } from "next";
import { Libre_Baskerville, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-journal",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "AI Journal",
  description: "A bullet journal-inspired app with AI-powered reflection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${libreBaskerville.variable} ${robotoCondensed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
