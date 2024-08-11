import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { getSessionAndBody, patchParams } from "~/server/utils";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function GET(req: NextRequest, { params }: { params: { accountId: string, operationalYearId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accountId = parseInt(params.accountId);
    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(accountId) || isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid accountId or operationalYearId" }, { status: 400 });	
    }

    const operationalYearAccountInitial = await db.select().from(schema.operationalYearAccountInitials).where(and(eq(schema.operationalYearAccountInitials.userId, session.user.id), eq(schema.operationalYearAccountInitials.accountId, accountId), eq(schema.operationalYearAccountInitials.operationalYearId, operationalYearId))).execute();
    if (operationalYearAccountInitial.length === 0) {
        return NextResponse.json({ message: "Invalid operationalYearAccountInitialId" }, { status: 404 });
    }

    return NextResponse.json(operationalYearAccountInitial[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { accountId: string, operationalYearId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const accountId = parseInt(params.accountId);
    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(accountId) || isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid accountId or operationalYearId" }, { status: 400 });	
    }

    const operationalYearAccountInitials = await db.select().from(schema.operationalYearAccountInitials).where(and(eq(schema.operationalYearAccountInitials.userId, session.user.id), eq(schema.operationalYearAccountInitials.accountId, accountId), eq(schema.operationalYearAccountInitials.operationalYearId, operationalYearId))).execute();
    if (operationalYearAccountInitials.length === 0 || operationalYearAccountInitials[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearAccountInitialId" }, { status: 404 });
    }
    const operationalYearAccountInitial = operationalYearAccountInitials[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "accountId", type: "number", defaultValue: operationalYearAccountInitial.accountId, allowNull: false },
        { name: "operationalYearId", type: "number", defaultValue: operationalYearAccountInitial.operationalYearId, allowNull: false },
        { name: "initialValue", type: "string", defaultValue: operationalYearAccountInitial.initialValue, allowNull: false },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { accountId: newAccountId, operationalYearId: newOperationalYearId, initialValue: newInitialValue } = values;

    try {
        await db.update(schema.operationalYearAccountInitials).set({
            accountId: newAccountId,
            operationalYearId: newOperationalYearId,
            initialValue: newInitialValue,
        }).where(and(eq(schema.operationalYearAccountInitials.userId, session.user.id), eq(schema.operationalYearAccountInitials.accountId, accountId), eq(schema.operationalYearAccountInitials.operationalYearId, operationalYearId))).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { accountId: string, operationalYearId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accountId = parseInt(params.accountId);
    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(accountId) || isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid accountId or operationalYearId" }, { status: 400 });	
    }

    const operationalYearAccountInitials = await db.select().from(schema.operationalYearAccountInitials).where(and(eq(schema.operationalYearAccountInitials.userId, session.user.id), eq(schema.operationalYearAccountInitials.accountId, accountId), eq(schema.operationalYearAccountInitials.operationalYearId, operationalYearId))).execute();
    if (operationalYearAccountInitials.length === 0 || operationalYearAccountInitials[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearAccountInitialId" }, { status: 404 });
    }

    try {
        await db.delete(schema.operationalYearAccountInitials).where(and(eq(schema.operationalYearAccountInitials.userId, session.user.id), eq(schema.operationalYearAccountInitials.accountId, accountId), eq(schema.operationalYearAccountInitials.operationalYearId, operationalYearId))).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}