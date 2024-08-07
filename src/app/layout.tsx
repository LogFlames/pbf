import "~/styles/globals.css";

import { type Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "PBF",
  description: "Privat Bokföring",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

async function TopNav() {
  const csrfToken = cookies().get('next-auth.csrf-token')?.value.split('|')[0];
  return (
    <nav className="flex w-full justify-between items-center p-4 text-xl border-b">
      <Link href="/">
        PBF
      </Link>
      <Link href="/transactions">
        Transactions
      </Link>
      <Link href="/verifications">
        Verifications
      </Link>
      <Link href="/config">
        Config
      </Link>
      <Link href="/dashboard">
        Dashboard
      </Link>
      <form method="POST" action="/api/auth/signout">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <button type="submit">
          <FontAwesomeIcon icon={faSignOutAlt} className="w-6 h-6" />
        </button>
      </form>
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
