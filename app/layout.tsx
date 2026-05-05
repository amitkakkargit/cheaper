import type { Metadata } from "next";
import AccountMenu from "@/components/AccountMenu";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Cheaper Marketplace",
  description: "Find nearby deals in an Instagram-style marketplace feed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <a href="/" className="brand-link">
            Cheaper
          </a>
          <AccountMenu />
        </header>
        {children}
      </body>
    </html>
  );
}
