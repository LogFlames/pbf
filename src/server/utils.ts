import { eq } from "drizzle-orm";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "~/app/api/auth/[...nextauth]/options";
import { db } from "./db";
import * as schema from "./db/schema";

export async function newAccountParentIdWouldResultInCyclic(userId: string, accountId: number, newAccountParentId: number): Promise<boolean> {
    const accounts = await db.select().from(schema.accounts).where(eq(schema.accounts.userId, userId)).execute();

    const visited = [];

    let current = accounts.find(a => a.id === accountId);
    visited.push(accountId);

    if (!current) {
        throw new Error("Invalid account id");
    }

    current.parentAccountId = newAccountParentId;

    while (current.parentAccountId !== null && !visited.includes(current.parentAccountId)) {
        visited.push(current.id);
        current = accounts.find(a => a.id === current?.parentAccountId);

        if (!current) {
            throw new Error("Invalid parentAccountId");
        }
    }

    if (current.parentAccountId === null) {
        return false;
    }

    return true;
}

export async function getSessionAndBody(req: NextRequest): Promise<{ session: Session; body: any, response: null } | { response: NextResponse, session: null, body: null }> {
    let session = await getServerSession(authOptions);
    if (!session) {
        return { response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }), session: null, body: null };
    }

    let body;
    try {
        body = await req.json();
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === "SyntaxError") {
            return { response: NextResponse.json({ message: "Invalid JSON, failed to parse body" }, { status: 400 }), session: null, body: null };
        }

        return { response: NextResponse.json({ message: "Unknown error" }, { status: 500 }), session: null, body: null };
    }

    return { session, body, response: null };
}

export function patchParams(body: any, params: { name: string, type: string, defaultValue: any, allowNull: boolean }[]): { values: { [key: string]: any }, response: null } | { response: NextResponse, values: null } {
    const values: { [key: string]: any } = {};
    for (const param of params) {
        values[param.name] = param.defaultValue

        if (typeof body[param.name] !== "undefined") {
            if (typeof body[param.name] !== param.type && (body[param.name] !== null || !param.allowNull)) {
                return { response: NextResponse.json({ message: "Invalid " + param.name }, { status: 400 }), values: null };
            }
            values[param.name] = body[param.name];
        }
    }

    return { values, response: null };
}