import Link from "next/link";
import { db } from "~/server/db";

export default async function HomePage() {
  return (
    <main className="">
      <div className="flex justify-center">
        Welcome to PBF!
      </div>
    </main>
  );
}
