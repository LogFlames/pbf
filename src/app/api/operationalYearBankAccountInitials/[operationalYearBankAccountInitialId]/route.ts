import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionAndBody, patchParams } from "~/server/utils";

export async function GET(req: NextRequest, { params }: { params: { operationalYearBankAccountInitialId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const operationalYearBankAccountInitialId = parseInt(params.operationalYearBankAccountInitialId);

    if (isNaN(operationalYearBankAccountInitialId)) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 400 });
    }

    const operationalYearBankAccountInitial = await db.select().from(schema.operationalYearBankAccountInitials).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.id, operationalYearBankAccountInitialId))).execute();
    if (operationalYearBankAccountInitial.length === 0) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 404 });
    }

    return NextResponse.json(operationalYearBankAccountInitial[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { operationalYearBankAccountInitialId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const operationalYearBankAccountInitialId = parseInt(params.operationalYearBankAccountInitialId);

    if (isNaN(operationalYearBankAccountInitialId)) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 400 });
    }

    const operationalYearBankAccountInitials = await db.select().from(schema.operationalYearBankAccountInitials).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.id, operationalYearBankAccountInitialId))).execute();
    if (operationalYearBankAccountInitials.length === 0 || operationalYearBankAccountInitials[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 404 });
    }
    const operationalYearBankAccountInitial = operationalYearBankAccountInitials[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "bankAccountId", type: "number", defaultValue: operationalYearBankAccountInitial.bankAccountId, allowNull: false },
        { name: "operationalYearId", type: "number", defaultValue: operationalYearBankAccountInitial.operationalYearId, allowNull: false },
        { name: "initialValue", type: "number", defaultValue: operationalYearBankAccountInitial.initialValue, allowNull: false },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { newBankAccountId, newOperationalYearId, newInitialValue } = values;

    try {
        await db.update(schema.operationalYearBankAccountInitials).set({
            bankAccountId: newBankAccountId,
            operationalYearId: newOperationalYearId,
            initialValue: newInitialValue,
        }).where(eq(schema.operationalYearBankAccountInitials.id, operationalYearBankAccountInitialId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { operationalYearBankAccountInitialId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const operationalYearBankAccountInitialId = parseInt(params.operationalYearBankAccountInitialId);

    if (isNaN(operationalYearBankAccountInitialId)) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 400 });
    }

    const operationalYearBankAccountInitials = await db.select().from(schema.operationalYearBankAccountInitials).where(and(eq(schema.operationalYearBankAccountInitials.userId, session.user.id), eq(schema.operationalYearBankAccountInitials.id, operationalYearBankAccountInitialId))).execute();
    if (operationalYearBankAccountInitials.length === 0 || operationalYearBankAccountInitials[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearBankAccountInitialId" }, { status: 404 });
    }

    try {
        await db.delete(schema.operationalYearBankAccountInitials).where(eq(schema.operationalYearBankAccountInitials.id, operationalYearBankAccountInitialId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}