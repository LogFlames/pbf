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

    const verificationAttachments = await db.select().from(schema.verificationAttachments).where(eq(schema.verificationAttachments.userId, session.user.id)).execute();
    return NextResponse.json(verificationAttachments);
}

export async function POST(req: NextRequest) {
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
    }

    if (!body.verificationId) {
        return NextResponse.json({ message: "Missing verificationId" }, { status: 400 });
    }

    if (!body.filePath) {
        return NextResponse.json({ message: "Missing filePath" }, { status: 400 }); 
    }

    if (typeof body.verificationId !== "number") {
        return NextResponse.json({ message: "Invalid verificationId" }, { status: 400 });
    }

    if (typeof body.filePath !== "string") {
        return NextResponse.json({ message: "Invalid filePath" }, { status: 400 });
    }

    try {
        const newverificationAttachment = await db.insert(schema.verificationAttachments).values({
            userId: session.user.id,
            verificationId: body.verificationId,
            filePath: body.filePath,
        }).returning();

        return NextResponse.json(newverificationAttachment[0]);
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }
}