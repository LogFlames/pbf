import { eq } from "drizzle-orm";
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