import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionAndBody, patchParams } from "~/server/utils";

export async function GET(req: NextRequest, { params }: { params: { verificationAttachmentId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verificationAttachmentId = parseInt(params.verificationAttachmentId);

    if (isNaN(verificationAttachmentId)) {
        return NextResponse.json({ message: "Invalid verificationAttachmentId" }, { status: 400 });
    }

    const verificationAttachment = await db.select().from(schema.verificationAttachments).where(and(eq(schema.verificationAttachments.userId, session.user.id), eq(schema.verificationAttachments.id, verificationAttachmentId))).execute();
    if (verificationAttachment.length === 0) {
        return NextResponse.json({ message: "Invalid verificationAttachmentId" }, { status: 404 });
    }

    return NextResponse.json(verificationAttachment[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { verificationAttachmentId: string } }) {
    const { session, body, response: sessionAndBodyResponse } = await getSessionAndBody(req);
    if (sessionAndBodyResponse) {
        return sessionAndBodyResponse;
    } 

    const verificationAttachmentId = parseInt(params.verificationAttachmentId);

    if (isNaN(verificationAttachmentId)) {
        return NextResponse.json({ message: "Invalid verificationAttachmentId" }, { status: 400 });
    }

    const verificationAttachments = await db.select().from(schema.verificationAttachments).where(and(eq(schema.verificationAttachments.userId, session.user.id), eq(schema.verificationAttachments.id, verificationAttachmentId))).execute();
    if (verificationAttachments.length === 0 || verificationAttachments[0] === undefined) {
        return NextResponse.json({ message: "Invalid verificationAttachmentId" }, { status: 404 });
    }
    const verificationAttachment = verificationAttachments[0];

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "verificationId", type: "number", defaultValue: verificationAttachment.verificationId, allowNull: false },
        { name: "filePath", type: "string", defaultValue: verificationAttachment.filePath, allowNull: false },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    const { verificationId: newVerificationId, filePath: newFilePath } = values;

    try {
        await db.update(schema.verificationAttachments).set({
            verificationId: newVerificationId,
            filePath: newFilePath,
        }).where(eq(schema.verificationAttachments.id, verificationAttachmentId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { verificationAttachmentId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verificationAttachmentId = parseInt(params.verificationAttachmentId);

    if (isNaN(verificationAttachmentId)) {
        return NextResponse.json({ message: "Invalid verificationAttachmentId" }, { status: 400 });
    }

    const verificationAttachments = await db.select().from(schema.verificationAttachments).where(and(eq(schema.verificationAttachments.userId, session.user.id), eq(schema.verificationAttachments.id, verificationAttachmentId))).execute();
    if (verificationAttachments.length === 0 || verificationAttachments[0] === undefined) {
        return NextResponse.json({ message: "Invalid verificationAttachmentId" }, { status: 404 });
    }

    try {
        await db.delete(schema.verificationAttachments).where(eq(schema.verificationAttachments.id, verificationAttachmentId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}