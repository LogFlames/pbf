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

    const operationalYearAccountInitials = await db.select().from(schema.operationalYearAccountInitials).where(eq(schema.operationalYearAccountInitials.userId, session.user.id)).execute();
    return NextResponse.json(operationalYearAccountInitials);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.accountId) {
        return NextResponse.json({ message: "Missing accountId" }, { status: 400 });
    }

    if (!body.operationalYearId) {
        return NextResponse.json({ message: "Missing operationalYearId" }, { status: 400 });
    }

    if (!body.initialValue) {
        return NextResponse.json({ message: "Missing initialValue" }, { status: 400 });
    }

    if (typeof body.accountId !== "number") {
        return NextResponse.json({ message: "Invalid accountId" }, { status: 400 });
    }

    if (typeof body.operationalYearId !== "number") {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 400 });
    }

    if (typeof body.initialValue !== "string") {
        return NextResponse.json({ message: "Invalid initialValue" }, { status: 400 });
    }


    try {
        const newoperationalYearAccountInitial = await db.insert(schema.operationalYearAccountInitials).values({
            userId: session.user.id,
            accountId: body.accountId,
            operationalYearId: body.operationalYearId,
            initialValue: body.initialValue,
        }).returning();

        return NextResponse.json(newoperationalYearAccountInitial[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}