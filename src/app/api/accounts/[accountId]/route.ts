import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import * as schema from "~/server/db/schema";
import { getSessionAndBody, newAccountParentIdWouldResultInCyclic, patchParams } from "~/server/utils";
import { authOptions } from "../../auth/[...nextauth]/options";

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
    const { session, body, response } = await getSessionAndBody(req);
    if (response) {
        return response;
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

    const { values, response: patchParamsResponse } = patchParams(body, [
        { name: "name", type: "string", defaultValue: account.name, allowNull: false },
        { name: "description", type: "string", defaultValue: account.description, allowNull: true },
        { name: "parentAccountId", type: "number", defaultValue: account.parentAccountId, allowNull: true },
    ]);

    if (patchParamsResponse) {
        return patchParamsResponse;
    }

    let { name: newName, description: newDescription, parentAccountId: newParentAccountId } = values;
    newDescription = newDescription || null;

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
            description: newDescription,
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