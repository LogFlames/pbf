import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type AccountWithChildren = { id: number, name: string, description: string | null, parentAccountId: number | null, children: AccountWithChildren[] };

export function buildAccountMap(accounts: { id: number, name: string, description: string | null, parentAccountId: number | null }[]) {
  const map: { [key: number]: AccountWithChildren } = {};

  accounts.forEach(item => {
    map[item.id] = {
      id: item.id,
      name: item.name,
      description: item.description,
      parentAccountId: item.parentAccountId,
      children: [],
    };
  });

  return map;
}

export function buildAccountTree(accounts: { id: number, name: string, description: string | null, parentAccountId: number | null }[]) {
  const map = buildAccountMap(accounts);
  const tree: { [key: number]: AccountWithChildren } = {};

  accounts.forEach(item => {
    let mappedAccount = map[item.id];
    if (!mappedAccount) {
      throw new Error(`Account ${item.id} not in map`);
    }

    if (item.parentAccountId === null) {
      tree[item.id] = mappedAccount;
    } else {
      const parentAccount = map[item.parentAccountId];
      if (!parentAccount) {
        throw new Error(`Parent account ${item.parentAccountId} not in map`);
      }
      parentAccount.children.push(mappedAccount);
    }
  });
  return tree;
}

export function findMaxDepth(tree: { [key: number]: AccountWithChildren }) {
  let maxDepth = 0;
  for (const item of Object.values(tree)) {
    if (item.children.length > 0) {
      const depth = 1 + findMaxDepth(item.children);
      if (depth > maxDepth) {
        maxDepth = depth;
      }
    }
  }
  return maxDepth;
}