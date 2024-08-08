import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { eq } from "drizzle-orm";
import * as schema from "~/server/db/schema";
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";
import { getSessionAndBody } from "~/server/utils";

export async function GET(req: NextApiRequest) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const operationalYearBankAccountInitials = await db.select().from(schema.operationalYearBankAccountInitials).where(eq(schema.operationalYearBankAccountInitials.userId, session.user.id)).execute();
    return NextResponse.json(operationalYearBankAccountInitials);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.bankAccountId) {
        return NextResponse.json({ message: "Missing bankAccountId" }, { status: 400 });
    }

    if (!body.operationalYearId) {
        return NextResponse.json({ message: "Missing operationalYearId" }, { status: 400 });
    }

    if (!body.initialValue) {
        return NextResponse.json({ message: "Missing initialValue" }, { status: 400 });
    }

    if (typeof body.bankAccountId !== "number") {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 400 });
    }

    if (typeof body.operationalYearId !== "number") {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 400 });
    }

    if (typeof body.initialValue !== "number") {
        return NextResponse.json({ message: "Invalid initialValue" }, { status: 400 });
    }


    try {
        const newoperationalYearBankAccountInitial = await db.insert(schema.operationalYearBankAccountInitials).values({
            userId: session.user.id,
            bankAccountId: body.bankAccountId,
            operationalYearId: body.operationalYearId,
            initialValue: body.initialValue,
        }).returning();

        return NextResponse.json(newoperationalYearBankAccountInitial[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}