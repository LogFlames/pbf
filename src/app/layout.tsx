import "~/styles/globals.css";
import { cn } from "~/lib/utils";

import { type Metadata } from "next";
import { Inter as FontSans } from 'next/font/google'
import { ThemeProvider } from "~/components/theme-provider";
import { Combobox } from "~/components/combobox";

import * as schema from "~/server/db/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";
import { Nav, TopNav } from "~/components/navigation";
import { db } from "~/server/db";

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "PBF",
  description: "Privat Bokföring",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="grid md:min-h-screen w-full grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="border-r bg-muted/40">
              <Nav />
            </div>
            <div className="flex flex-col">
              <TopNav />
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
