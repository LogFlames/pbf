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

    const operationalYears = await db.select().from(schema.operationalYears).where(eq(schema.operationalYears.userId, session.user.id)).execute();
    return NextResponse.json(operationalYears);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.name) {
        return NextResponse.json({ message: "Missing name" }, { status: 400 });
    }

    if (!body.startDate) {
        return NextResponse.json({ message: "Missing startDate" }, { status: 400 });
    }

    if (!body.endDate) {
        return NextResponse.json({ message: "Missing endDate" }, { status: 400 });
    }

    if (typeof body.name !== "string") {
        return NextResponse.json({ message: "Invalid name" }, { status: 400 });
    }

    if (typeof body.startDate !== "string") {
        return NextResponse.json({ message: "Invalid startDate" }, { status: 400 });
    }

    let startDate = new Date(body.startDate);
    if (isNaN(startDate.getTime())) {
        return NextResponse.json({ message: "Invalid startDate" }, { status: 400 });
    }

    if (typeof body.endDate !== "string") {
        return NextResponse.json({ message: "Invalid endDate" }, { status: 400 });
    }

    let endDate = new Date(body.endDate);
    if (isNaN(endDate.getTime())) {
        return NextResponse.json({ message: "Invalid endDate" }, { status: 400 });
    }

    try {
        const newOperationalYear = await db.insert(schema.operationalYears).values({
            userId: session.user.id,
            name: body.name,
            startDate: startDate,
            endDate: endDate,
        }).returning();

        return NextResponse.json(newOperationalYear[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}