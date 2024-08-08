import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionAndBody, patchParams } from "~/server/utils";

export async function GET(req: NextRequest, { params }: { params: { verificationId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verificationId = parseInt(params.verificationId);

    if (isNaN(verificationId)) {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 400 });
    }

    const verification = await db.select().from(schema.verifications).where(and(eq(schema.verifications.userId, session.user.id), eq(schema.verifications.id, verificationId))).execute();
    if (verification.length === 0) {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 404 });
    }

    return NextResponse.json(verification[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { verificationId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const verificationId = parseInt(params.verificationId);

    if (isNaN(verificationId)) {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 400 });
    }

    const verifications = await db.select().from(schema.verifications).where(and(eq(schema.verifications.userId, session.user.id), eq(schema.verifications.id, verificationId))).execute();
    if (verifications.length === 0 || verifications[0] === undefined) {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 404 });
    }
    const verification = verifications[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "name", type: "string", defaultValue: verification.name, allowNull: false },
        { name: "date", type: "string", defaultValue: verification.date.toISOString(), allowNull: false },
        { name: "description", type: "string", defaultValue: verification.description, allowNull: true },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { name: newName, date: newDateString, description: newDescription } = values;

    const newDate = new Date(newDateString);
    if (isNaN(newDate.getTime())) {
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    }

    try {
        await db.update(schema.verifications).set({
            name: newName,
            date: newDate,
            description: newDescription,
        }).where(eq(schema.verifications.id, verificationId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { verificationId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verificationId = parseInt(params.verificationId);

    if (isNaN(verificationId)) {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 400 });
    }

    const verifications = await db.select().from(schema.verifications).where(and(eq(schema.verifications.userId, session.user.id), eq(schema.verifications.id, verificationId))).execute();
    if (verifications.length === 0 || verifications[0] === undefined) {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 404 });
    }

    try {
        await db.delete(schema.verifications).where(eq(schema.verifications.id, verificationId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}