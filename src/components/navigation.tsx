"use client";

import { InferSelectModel } from "drizzle-orm";
import { BadgeDollarSign, CalendarFold, GitCommitHorizontal, HandCoins, Home, Landmark, LineChart, LogOut, Menu, Package, Package2, ReceiptText, ShoppingCart, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { getCsrfToken, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import * as schema from "~/server/db/schema";
import { Separator } from "./ui/separator";

export function TopNav() {
  const [operationalYears, setOperationalYears] = useState<InferSelectModel<typeof schema.operationalYears>[]>([]);

  useEffect(() => {
    fetch("/api/operationalYears", {method: "GET"}).then(res => res.json()).then(data => {
      setOperationalYears(data);
    });
  }, []);

  if (window.localStorage.getItem("operationalYear") === null && operationalYears.length > 0 && operationalYears[0] !== undefined) {
    window.localStorage.setItem("operationalYear", operationalYears[0].id.toString());
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b px-4 h-[60px] px-6">
      {operationalYears.length > 0 &&
        <Select
          defaultValue={window.localStorage.getItem("operationalYear") ?? operationalYears[0]?.id.toString()}
          onValueChange={(value) => { 
            window.localStorage.setItem("operationalYear", value);
            window.location.reload();
           }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Operational year" />
          </SelectTrigger>
          <SelectContent>
            {operationalYears.sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    </header>
  );
}

export function Nav() {
  const [csrfToken, setCsrfToken] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) {
        setCsrfToken(token);
      }
    });
  }, []);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setSession(session);
      }
    });
  }, []);

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 h-[60px] px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="">{session?.user?.firstname} {session?.user?.lastname}</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium px-4">
          <Link
            href="/analytics"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${pathname.startsWith("/analytics") ? "bg-primary text-background" : "hover:text-primary"}`}
          >
            <LineChart className="h-4 w-4" />
            Analytics
          </Link>
          <Link
            href="/verifications"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${pathname.startsWith("/verifications") ? "bg-primary text-background" : "hover:text-primary"}`}
          >
            <BadgeDollarSign className="h-4 w-4" />
            Verifications
          </Link>
          <Link
            href="/transactions"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${pathname.startsWith("/transactions") ? "bg-primary text-background" : "hover:text-primary"}`}
          >
            <HandCoins className="h-4 w-4" />
            Transactions
            {/*
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
            6
            </Badge>
            */}
          </Link>
          <Link
            href="/accounts"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${pathname.startsWith("/accounts") ? "bg-primary text-background" : "hover:text-primary"}`}
          >
            <ReceiptText className="h-4 w-4" />
            Accounts
          </Link>
          <Link
            href="/operationalYearInitialBalances"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${pathname.startsWith("/operationalYearInitialBalances") ? "bg-primary text-background" : "hover:text-primary"}`}
          >
            <GitCommitHorizontal className="h-4 w-4" />
            Initial Balances
          </Link>
          <Separator className="mt-2" />
          <Link
            href="/bankAccounts"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${pathname.startsWith("/bankAccounts") ? "bg-primary text-background" : "hover:text-primary"}`}
          >
            <Landmark className="h-4 w-4" />
            Bank Accounts
          </Link>
          <Link
            href="/operationalYears"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all ${pathname.startsWith("/operationalYears") ? "bg-primary text-background" : "hover:text-primary"}`}
          >
            <CalendarFold className="h-4 w-4" />
            Operational Years
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-4">
        <form method="POST" action="/api/auth/signout">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <Button type="submit" className="w-full">
            Signout
            <LogOut className="h-4 w-4 m-2" />
          </Button>
        </form>
      </div>
    </div>
  )
}