import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export const metadata: Metadata = {
  title: "PBF",
  description: "Privat Bokföring",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

function TopNav() {
  return (
    <nav className="flex w-full justify-between items-center p-4 text-xl border-b">
      <Link href="/" prefetch={true} className="text-white">
        PBF
      </Link>
      <Link href="/transactions" prefetch={true} className="text-white">
        Transactions
      </Link>
      <Link href="/verifications" prefetch={true} className="text-white">
        Verifications
      </Link>
      <Link href="/config" prefetch={true} className="text-white">
        Config
      </Link>
      <Link href="/dashboard" prefetch={true} className="text-white">
        Dashboard
      </Link>
      <Link href="/api/auth/signout" className="text-white">
        <FontAwesomeIcon icon={faSignOutAlt} className="w-6 h-6" />
      </Link>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex flex-col gap-4">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
