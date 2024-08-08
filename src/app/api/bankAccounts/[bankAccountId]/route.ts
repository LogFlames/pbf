import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionAndBody, patchParams } from "~/server/utils";

export async function GET(req: NextRequest, { params }: { params: { bankAccountId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bankAccountId = parseInt(params.bankAccountId);

    if (isNaN(bankAccountId)) {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 400 });
    }

    const bankAccount = await db.select().from(schema.bankAccounts).where(and(eq(schema.bankAccounts.userId, session.user.id), eq(schema.bankAccounts.id, bankAccountId))).execute();
    if (bankAccount.length === 0) {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 404 });
    }

    return NextResponse.json(bankAccount[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { bankAccountId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const bankAccountId = parseInt(params.bankAccountId);

    if (isNaN(bankAccountId)) {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 400 });
    }

    const bankAccounts = await db.select().from(schema.bankAccounts).where(and(eq(schema.bankAccounts.userId, session.user.id), eq(schema.bankAccounts.id, bankAccountId))).execute();
    if (bankAccounts.length === 0 || bankAccounts[0] === undefined) {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 404 });
    }
    const bankAccount = bankAccounts[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "name", type: "string", defaultValue: bankAccount.name, allowNull: false },
        { name: "bank", type: "string", defaultValue: bankAccount.bank, allowNull: false },
        { name: "clearingNumber", type: "string", defaultValue: bankAccount.clearingNumber, allowNull: false },
        { name: "accountNumber", type: "string", defaultValue: bankAccount.accountNumber, allowNull: false },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { name: newName, bank: newBank, clearingNumber: newClearingNumber, accountNumber: newAccountNumber } = values;

    if (newAccountNumber.match(/^[\d]+$/) === null) {
        return NextResponse.json({ message: "Invalid accountNumber" }, { status: 400 });
    }

    if (newClearingNumber.match(/^[\d]{4}$/) === null) {
        return NextResponse.json({ message: "Invalid clearingNumber" }, { status: 400 });
    }


    try {
        await db.update(schema.bankAccounts).set({
            name: newName,
            bank: newBank,
            clearingNumber: newClearingNumber,
            accountNumber: newAccountNumber,
        }).where(eq(schema.bankAccounts.id, bankAccountId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { bankAccountId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bankAccountId = parseInt(params.bankAccountId);

    if (isNaN(bankAccountId)) {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 400 });
    }

    const bankAccounts = await db.select().from(schema.bankAccounts).where(and(eq(schema.bankAccounts.userId, session.user.id), eq(schema.bankAccounts.id, bankAccountId))).execute();
    if (bankAccounts.length === 0 || bankAccounts[0] === undefined) {
        return NextResponse.json({ message: "Invalid bankAccountId" }, { status: 404 });
    }

    try {
        await db.delete(schema.bankAccounts).where(eq(schema.bankAccounts.id, bankAccountId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}