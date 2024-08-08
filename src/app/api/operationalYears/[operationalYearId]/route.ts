import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionAndBody, patchParams } from "~/server/utils";

export async function GET(req: NextRequest, { params }: { params: { operationalYearId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 400 });
    }

    const operationalYear = await db.select().from(schema.operationalYears).where(and(eq(schema.operationalYears.userId, session.user.id), eq(schema.operationalYears.id, operationalYearId))).execute();
    if (operationalYear.length === 0) {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 404 });
    }

    return NextResponse.json(operationalYear[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { operationalYearId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 400 });
    }

    const operationalYears = await db.select().from(schema.operationalYears).where(and(eq(schema.operationalYears.userId, session.user.id), eq(schema.operationalYears.id, operationalYearId))).execute();
    if (operationalYears.length === 0 || operationalYears[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 404 });
    }
    const operationalYear = operationalYears[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "name", type: "string", defaultValue: operationalYear.name, allowNull: false },
        { name: "startDate", type: "string", defaultValue: operationalYear.startDate.toISOString(), allowNull: false },
        { name: "endDate", type: "string", defaultValue: operationalYear.startDate.toISOString(), allowNull: false },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { name: newName, startDate: newStartDateString, endDate: newEndDateString } = values;

    const newStartDate = new Date(newStartDateString);
    if (isNaN(newStartDate.getTime())) {
        return NextResponse.json({ message: "Invalid startDate" }, { status: 400 });
    }

    const newEndDate = new Date(newEndDateString);
    if (isNaN(newEndDate.getTime())) {
        return NextResponse.json({ message: "Invalid endDate" }, { status: 400 });
    }

    try {
        await db.update(schema.operationalYears).set({
            name: newName,
            startDate: newStartDate,
            endDate: newEndDate,
        }).where(eq(schema.operationalYears.id, operationalYearId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { operationalYearId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const operationalYearId = parseInt(params.operationalYearId);

    if (isNaN(operationalYearId)) {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 400 });
    }

    const operationalYears = await db.select().from(schema.operationalYears).where(and(eq(schema.operationalYears.userId, session.user.id), eq(schema.operationalYears.id, operationalYearId))).execute();
    if (operationalYears.length === 0 || operationalYears[0] === undefined) {
        return NextResponse.json({ message: "Invalid operationalYearId" }, { status: 404 });
    }

    try {
        await db.delete(schema.operationalYears).where(eq(schema.operationalYears.id, operationalYearId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}