import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { getSessionAndBody, patchParams } from "~/server/utils";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function GET(req: NextRequest, { params }: { params: { bankAccountId: string, operationalYearId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bankAccountId = parseInt(params.bankAccountId);
    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(bankAccountId) || isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid bankAccountId or operationalYearId" }, { status: 400 });	
    }

    const operationalYearBankAccountInitial = await db.select().from(schema.operationalYearBankAccountInitials).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.bankAccountId, bankAccountId), eq(schema.operationalYearBankAccountInitials.operationalYearId, operationalYearId))).execute();
    if (operationalYearBankAccountInitial.length === 0) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 404 });
    }

    return NextResponse.json(operationalYearBankAccountInitial[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { bankAccountId: string, operationalYearId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const bankAccountId = parseInt(params.bankAccountId);
    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(bankAccountId) || isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid bankAccountId or operationalYearId" }, { status: 400 });	
    }

    const operationalYearBankAccountInitials = await db.select().from(schema.operationalYearBankAccountInitials).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.bankAccountId, bankAccountId), eq(schema.operationalYearBankAccountInitials.operationalYearId, operationalYearId))).execute();
    if (operationalYearBankAccountInitials.length === 0 || operationalYearBankAccountInitials[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 404 });
    }
    const operationalYearBankAccountInitial = operationalYearBankAccountInitials[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "bankAccountId", type: "number", defaultValue: operationalYearBankAccountInitial.bankAccountId, allowNull: false },
        { name: "operationalYearId", type: "number", defaultValue: operationalYearBankAccountInitial.operationalYearId, allowNull: false },
        { name: "initialValue", type: "string", defaultValue: operationalYearBankAccountInitial.initialValue, allowNull: false },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { bankAccountId: newbankAccountId, operationalYearId: newOperationalYearId, initialValue: newInitialValue } = values;

    try {
        await db.update(schema.operationalYearBankAccountInitials).set({
            bankAccountId: newbankAccountId,
            operationalYearId: newOperationalYearId,
            initialValue: newInitialValue,
        }).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.bankAccountId, bankAccountId), eq(schema.operationalYearBankAccountInitials.operationalYearId, operationalYearId))).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { bankAccountId: string, operationalYearId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const bankAccountId = parseInt(params.bankAccountId);
    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(bankAccountId) || isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid bankAccountId or operationalYearId" }, { status: 400 });	
    }

    const operationalYearBankAccountInitials = await db.select().from(schema.operationalYearBankAccountInitials).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.bankAccountId, bankAccountId), eq(schema.operationalYearBankAccountInitials.operationalYearId, operationalYearId))).execute();
    if (operationalYearBankAccountInitials.length === 0 || operationalYearBankAccountInitials[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 404 });
    }

    try {
        await db.delete(schema.operationalYearBankAccountInitials).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.bankAccountId, bankAccountId), eq(schema.operationalYearBankAccountInitials.operationalYearId, operationalYearId))).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}