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

    const verifications = await db.select().from(schema.verifications).where(eq(schema.verifications.userId, session.user.id)).execute();
    return NextResponse.json(verifications);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.name) {
        return NextResponse.json({ message: "Missing name" }, { status: 400 });
    }

    if (!body.date) {
        return NextResponse.json({ message: "Missing date" }, { status: 400 });
    }

    const description = body.description || null;

    if (typeof body.name !== "string") {
        return NextResponse.json({ message: "Invalid name" }, { status: 400 });
    }

    let date = new Date(body.date);
    if (isNaN(date.getTime())) {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    if (typeof description !== "string" && description !== null) {
        return NextResponse.json({ message: "Invalid description" }, { status: 400 });
    }

    try {
        const newverification = await db.insert(schema.verifications).values({
            userId: session.user.id,
            name: body.name,
            date: date,
            description: description,
        }).returning();

        return NextResponse.json(newverification[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}