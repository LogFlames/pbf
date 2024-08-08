import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionAndBody, patchParams } from "~/server/utils";

export async function GET(req: NextRequest, { params }: { params: { transactionId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const transactionId = parseInt(params.transactionId);

    if (isNaN(transactionId)) {
        return NextResponse.json({ message: "Invalid transactionId" }, { status: 400 });
    }

    const transaction = await db.select().from(schema.transactions).where(and(eq(schema.transactions.userId, session.user.id), eq(schema.transactions.id, transactionId))).execute();
    if (transaction.length === 0) {
        return NextResponse.json({ message: "Invalid transactionId" }, { status: 404 });
    }

    return NextResponse.json(transaction[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { transactionId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const transactionId = parseInt(params.transactionId);

    if (isNaN(transactionId)) {
        return NextResponse.json({ message: "Invalid transactionId" }, { status: 400 });
    }

    const transactions = await db.select().from(schema.transactions).where(and(eq(schema.transactions.userId, session.user.id), eq(schema.transactions.id, transactionId))).execute();
    if (transactions.length === 0 || transactions[0] === undefined) {
        return NextResponse.json({ message: "Invalid transactionId" }, { status: 404 });
    }
    const transaction = transactions[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "operationalYearId", type: "number", defaultValue: transaction.operationalYearId, allowNull: false },
        { name: "bankAccountId", type: "number", defaultValue: transaction.bankAccountId, allowNull: false },
        { name: "date", type: "string", defaultValue: transaction.date.toISOString(), allowNull: false },
        { name: "amount", type: "number", defaultValue: transaction.amount, allowNull: false },
        { name: "saldo", type: "number", defaultValue: transaction.saldo, allowNull: false },
        { name: "text", type: "string", defaultValue: transaction.text, allowNull: false },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { operationalYearId: newOperationalYearId, bankAccountId: newBankAccountId, date: newDateString, amount: newAmount, saldo: newSaldo, text: newText } = values;

    const newDate = new Date(newDateString);
    if (isNaN(newDate.getTime())) {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    try {
        await db.update(schema.transactions).set({
            operationalYearId: newOperationalYearId,
            bankAccountId: newBankAccountId,
            date: newDate,
            amount: newAmount,
            saldo: newSaldo,
            text: newText,
        }).where(eq(schema.transactions.id, transactionId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { transactionId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const transactionId = parseInt(params.transactionId);

    if (isNaN(transactionId)) {
        return NextResponse.json({ message: "Invalid transactionId" }, { status: 400 });
    }

    const transactions = await db.select().from(schema.transactions).where(and(eq(schema.transactions.userId, session.user.id), eq(schema.transactions.id, transactionId))).execute();
    if (transactions.length === 0 || transactions[0] === undefined) {
        return NextResponse.json({ message: "Invalid transactionId" }, { status: 404 });
    }

    try {
        await db.delete(schema.transactions).where(eq(schema.transactions.id, transactionId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}