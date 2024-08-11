import { eq } from "drizzle-orm";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { getSessionAndBody } from "~/server/utils";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: NextApiRequest) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accounts = await db.select().from(schema.accounts).where(eq(schema.accounts.userId, session.user.id)).execute();
    return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.name) {
        return NextResponse.json({ message: "Missing name" }, { status: 400 });
    }

    let description = body.description || null;
    let parentAccountId = body.parentAccountId || null;

    if (typeof body.name !== "string") {
        return NextResponse.json({ message: "Invalid name" }, { status: 400 });
    }

    if (typeof description !== "string" && description !== null) {
        return NextResponse.json({ message: "Invalid description" }, { status: 400 });
    }

    if (typeof parentAccountId !== "number" && parentAccountId !== null) {
        return NextResponse.json({ message: "Invalid parentAccountId" }, { status: 400 });
    }

    try {
        const newAccount = await db.insert(schema.accounts).values({
            userId: session.user.id,
            name: body.name,
            description: description,
            parentAccountId: parentAccountId,
        }).returning();

        return NextResponse.json(newAccount[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}