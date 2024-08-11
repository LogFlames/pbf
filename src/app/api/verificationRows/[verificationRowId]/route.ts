import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { getSessionAndBody, patchParams } from "~/server/utils";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: NextRequest, { params }: { params: { verificationRowId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verificationRowId = parseInt(params.verificationRowId);

    if (isNaN(verificationRowId)) {
        return NextResponse.json({ message: "Invalid verificationRowId" }, { status: 400 });
    }

    const verificationRow = await db.select().from(schema.verificationRows).where(and(eq(schema.verificationRows.userId, session.user.id), eq(schema.verificationRows.id, verificationRowId))).execute();
    if (verificationRow.length === 0) {
        return NextResponse.json({ message: "Invalid verificationRowId" }, { status: 404 });
    }

    return NextResponse.json(verificationRow[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { verificationRowId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const verificationRowId = parseInt(params.verificationRowId);

    if (isNaN(verificationRowId)) {
        return NextResponse.json({ message: "Invalid verificationRowId" }, { status: 400 });
    }

    const verificationRows = await db.select().from(schema.verificationRows).where(and(eq(schema.verificationRows.userId, session.user.id), eq(schema.verificationRows.id, verificationRowId))).execute();
    if (verificationRows.length === 0 || verificationRows[0] === undefined) {
        return NextResponse.json({ message: "Invalid verificationRowId" }, { status: 404 });
    }
    const verificationRow = verificationRows[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "verificationId", type: "number", defaultValue: verificationRow.verificationId, allowNull: false },
        { name: "accountId", type: "number", defaultValue: verificationRow.accountId, allowNull: false },
        { name: "operationalYearId", type: "number", defaultValue: verificationRow.operationalYearId, allowNull: false },
        { name: "transactionId", type: "number", defaultValue: verificationRow.transactionId, allowNull: true },
        { name: "debit", type: "number", defaultValue: verificationRow.debit, allowNull: true },
        { name: "credit", type: "number", defaultValue: verificationRow.credit, allowNull: true },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { verificationId: newVerificationId, accountId: newAccountId, operationalYearId: newOperationalYearId, transactionId: newTransactionId, debit: newDebit, credit: newCredit } = values;

    if (newDebit === null && newCredit === null) {
        return NextResponse.json({ message: "Cannot set both debit and credit to null" }, { status: 400 });
    }

    try {
        await db.update(schema.verificationRows).set({
            verificationId: newVerificationId,
            accountId: newAccountId,
            operationalYearId: newOperationalYearId,
            transactionId: newTransactionId,
            debit: newDebit,
            credit: newCredit,
        }).where(eq(schema.verificationRows.id, verificationRowId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { verificationRowId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verificationRowId = parseInt(params.verificationRowId);

    if (isNaN(verificationRowId)) {
        return NextResponse.json({ message: "Invalid verificationRowId" }, { status: 400 });
    }

    const verificationRows = await db.select().from(schema.verificationRows).where(and(eq(schema.verificationRows.userId, session.user.id), eq(schema.verificationRows.id, verificationRowId))).execute();
    if (verificationRows.length === 0 || verificationRows[0] === undefined) {
        return NextResponse.json({ message: "Invalid verificationRowId" }, { status: 404 });
    }

    try {
        await db.delete(schema.verificationRows).where(eq(schema.verificationRows.id, verificationRowId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}