import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Construction Investment Management",
  description: "SaaS construction project investment tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
