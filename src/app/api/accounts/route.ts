import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { eq } from "drizzle-orm";
import * as schema from "~/server/db/schema";
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextApiRequest) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accounts = await db.select().from(schema.accounts).where(eq(schema.accounts.userId, session.user.id)).execute();
    return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name) {
        return NextResponse.json({ message: "Missing name" }, { status: 400 });
    }

    let parentAccountId = body.parentAccountId || null;

    try {
        const newAccount = await db.insert(schema.accounts).values({
            userId: session.user.id,
            name: body.name,
            parentAccountId: parentAccountId,
        }).returning();

        return NextResponse.json(newAccount[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}