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

    const bankAccounts = await db.select().from(schema.bankAccounts).where(eq(schema.bankAccounts.userId, session.user.id)).execute();
    return NextResponse.json(bankAccounts);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.name) {
        return NextResponse.json({ message: "Missing name" }, { status: 400 });
    }

    if (!body.bank) {
        return NextResponse.json({ message: "Missing bank" }, { status: 400 });
    }

    if (!body.accountNumber) {
        return NextResponse.json({ message: "Missing accountNumber" }, { status: 400 });
    }

    if (!body.clearingNumber) {
        return NextResponse.json({ message: "Missing clearingNumber" }, { status: 400 });
    }

    if (typeof body.name !== "string") {
        return NextResponse.json({ message: "Invalid name" }, { status: 400 });
    }

    if (typeof body.bank !== "string") {
        return NextResponse.json({ message: "Invalid bank" }, { status: 400 });
    }

    if (typeof body.accountNumber !== "string" || body.accountNumber.match(/^[\d]+$/) === null) {
        return NextResponse.json({ message: "Invalid accountNumber" }, { status: 400 });
    }

    if (typeof body.clearingNumber !== "string" || body.clearingNumber.match(/^[\d]{4}$/) === null) {
        return NextResponse.json({ message: "Invalid clearingNumber" }, { status: 400 });
    }

    try {
        const newBankAccount = await db.insert(schema.bankAccounts).values({
            userId: session.user.id,
            name: body.name,
            bank: body.bank,
            accountNumber: body.accountNumber,
            clearingNumber: body.clearingNumber,
        }).returning();

        return NextResponse.json(newBankAccount[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}