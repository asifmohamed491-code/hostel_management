import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: "OASYS | Hostel Management",
  description: "Smart Hostel Management Platform for OASYS Institute of Technology.",
  icons: {
    icon: "/assets/logo/oasys-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
