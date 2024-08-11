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

    const transactions = await db.select().from(schema.transactions).where(eq(schema.transactions.userId, session.user.id)).execute();
    return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.operationalYearId) {
        return NextResponse.json({ message: "Missing operationalYearId" }, { status: 400 });
    }

    if (!body.bankAccountId) {
        return NextResponse.json({ message: "Missing bankAccountId" }, { status: 400 });
    }

    if (!body.date) {
        return NextResponse.json({ message: "Missing date" }, { status: 400 });
    }

    if (!body.amount) {
        return NextResponse.json({ message: "Missing amount" }, { status: 400 });
    }

    if (!body.saldo) {
        return NextResponse.json({ message: "Missing saldo" }, { status: 400 });
    }

    if (!body.text) {
        return NextResponse.json({ message: "Missing text" }, { status: 400 });
    }

    if (typeof body.operationalYearId !== "number") {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 400 });
    }

    if (typeof body.bankAccountId !== "number") {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 400 });
    }

    if (typeof body.date !== "string") {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    let date = new Date(body.date);
    if (isNaN(date.getTime())) {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    if (typeof body.amount !== "number") {
        return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    if (typeof body.saldo !== "number") {
        return NextResponse.json({ message: "Invalid saldo" }, { status: 400 });
    }

    if (typeof body.text !== "string") {
        return NextResponse.json({ message: "Invalid text" }, { status: 400 });
    }

    try {
        const newTransaction = await db.insert(schema.transactions).values({
            userId: session.user.id,
            operationalYearId: body.operationalYearId,
            bankAccountId: body.bankAccountId,
            date: date,
            amount: body.amount,
            saldo: body.saldo,
            text: body.text,
        }).returning();

        return NextResponse.json(newTransaction[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}