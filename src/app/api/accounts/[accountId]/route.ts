import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { newAccountParentIdWouldResultInCyclic } from "~/server/utils";

export async function GET(req: NextRequest, { params }: { params: { accountId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accountId = parseInt(params.accountId);

    if (isNaN(accountId)) {
        return NextResponse.json({ message: "Invalid account id" }, { status: 400 });
    }

    const account = await db.select().from(schema.accounts).where(and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.id, accountId))).execute();
    if (account.length === 0) {
        return NextResponse.json({ message: "Invalid account id" }, { status: 404 });
    }

    return NextResponse.json(account[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: { accountId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accountId = parseInt(params.accountId);

    if (isNaN(accountId)) {
        return NextResponse.json({ message: "Invalid account id" }, { status: 400 });
    }

    const accounts = await db.select().from(schema.accounts).where(and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.id, accountId))).execute();
    if (accounts.length === 0 || accounts[0] === undefined) {
        return NextResponse.json({ message: "Invalid account id" }, { status: 404 });
    }
    const account = accounts[0];

    const { name, parentAccountId } = await req.json();
    let newName = account.name;
    let newParentAccountId = account.parentAccountId;

    if (name !== undefined) {
        if (typeof name !== "string" && name !== null) {
            return NextResponse.json({ message: "Invalid name" }, { status: 400 });
        }
        newName = name;
    }

    if (parentAccountId !== undefined) {
        if (typeof parentAccountId !== "number" && parentAccountId !== null) {
            return NextResponse.json({ message: "Invalid parentAccountId" }, { status: 400 });
        }
        newParentAccountId = parentAccountId;
    }


    if (newParentAccountId !== account.parentAccountId && newParentAccountId !== null) {
        try {            
            if (await newAccountParentIdWouldResultInCyclic(session.user.id, accountId, newParentAccountId)) {
                return NextResponse.json({ message: "Cyclic parentAccountId" }, { status: 400 });
            }
        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.message === "Invalid parentAccountId") {
                return NextResponse.json({ message: "Invalid parentAccountId" }, { status: 500 });
            }

            return NextResponse.json({ message: "Unknown error" }, { status: 500 });
        }
    }

    try {
        await db.update(schema.accounts).set({
            name: newName,
            parentAccountId: newParentAccountId,
        }).where(eq(schema.accounts.id, accountId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { accountId: string } }) {
    let session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accountId = parseInt(params.accountId);

    if (isNaN(accountId)) {
        return NextResponse.json({ message: "Invalid account id" }, { status: 400 });
    }

    const accounts = await db.select().from(schema.accounts).where(and(eq(schema.accounts.userId, session.user.id), eq(schema.accounts.id, accountId))).execute();
    if (accounts.length === 0 || accounts[0] === undefined) {
        return NextResponse.json({ message: "Invalid account id" }, { status: 404 });
    }

    try {
        await db.delete(schema.accounts).where(eq(schema.accounts.id, accountId)).execute();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "PostgresError") {
            return NextResponse.json({ message: "Database error, possible foreign key constraint" }, { status: 500 });
        }

        return NextResponse.json({ message: "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
}