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

    const verificationRows = await db.select().from(schema.verificationRows).where(eq(schema.verificationRows.userId, session.user.id)).execute();
    return NextResponse.json(verificationRows);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.verificationId) {
        return NextResponse.json({ message: "Missing verificationId" }, { status: 400 });
    }

    if (!body.accountId) {
        return NextResponse.json({ message: "Missing accountId" }, { status: 400 });
    }

    if (!body.operationalYearId) {
        return NextResponse.json({ message: "Missing operationalYearId" }, { status: 400 });
    }

    const transactionId = body.transactionId || null;

    const debit = body.debit || null;

    const credit = body.credit || null;

    if (typeof body.verificationId !== "number") {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 400 });
    }

    if (typeof body.accountId !== "number") {
        return NextResponse.json({ message: "Invalid accountId" }, { status: 400 });
    }

    if (typeof body.operationalYearId !== "number") {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 400 });
    }

    if (typeof transactionId !== "number" && transactionId !== null) {
        return NextResponse.json({ message: "Invalid transactionId" }, { status: 400 });
    }

    if (typeof debit !== "number" && debit !== null) {
        return NextResponse.json({ message: "Invalid debit" }, { status: 400 });
    }

    if (typeof credit !== "number" && credit !== null) {
        return NextResponse.json({ message: "Invalid credit" }, { status: 400 });
    }

    if (debit === null && credit === null) {
        return NextResponse.json({ message: "Missing both debit and credit" }, { status: 400 });
    }

    try {
        const newverificationRow = await db.insert(schema.verificationRows).values({
            userId: session.user.id,
            verificationId: body.verificationId,
            accountId: body.accountId,
            operationalYearId: body.operationalYearId,
            transactionId: transactionId,
            debit: debit,
            credit: credit,
        }).returning();

        return NextResponse.json(newverificationRow[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}