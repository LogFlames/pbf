import Link from "next/link";
import { db } from "~/server/db";

export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  console.log(posts);

  return (
    <main className="">
      <div className="flex justify-center">
        Hello (app in progress)
      </div>
    </main>
  );
}
