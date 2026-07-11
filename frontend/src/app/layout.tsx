import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus — Operations Dashboard",
  description: "Nexus USSD-to-Stellar remittance operations dashboard. Monitor transactions, manage wallets on Stellar Testnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-white">{children}</body>
    </html>
  );
}
