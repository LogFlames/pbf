"use client";

import { useState } from "react";
import Link from "next/link";

export default async function ConfigPage() {
  const accounts = [
    {
      id: 1,
      name: 'Skuld',
      parentAccountId: null,
      createdAt: "2024-08-04T19:07:39.031Z",
      updatedAt: null
    },
    {
      id: 2,
      name: 'Fysiksektionen',
      parentAccountId: 1,
      createdAt: "2024-08-04T19:08:01.063Z",
      updatedAt: null
    },
    {
      id: 3,
      name: 'Kårspexet',
      parentAccountId: 1,
      createdAt: "2024-08-04T19:08:23.962Z",
      updatedAt: null
    },
    {
      id: 4,
      name: 'Pappa',
      parentAccountId: 1,
      createdAt: "2024-08-04T19:09:09.699Z",
      updatedAt: null
    },
    {
      id: 5,
      name: 'Intäckt',
      parentAccountId: null,
      createdAt: "2024-08-04T19:09:24.800Z",
      updatedAt: null
    },
    {
      id: 6,
      name: 'Lön',
      parentAccountId: 5,
      createdAt: "2024-08-04T19:09:33.775Z",
      updatedAt: null
    },
    {
      id: 7,
      name: 'Around the Corner',
      parentAccountId: 6,
      createdAt: "2024-08-04T19:11:33.727Z",
      updatedAt: null
    },
    {
      id: 8,
      name: 'KTH',
      parentAccountId: 6,
      createdAt: "2024-08-04T19:11:41.970Z",
      updatedAt: null
    }
  ];

  // Placeholder functions
  const createAccount = async (account) => {
    console.log("Create account", account);
  };

  const updateAccount = async (id, updatedAccount) => {
    console.log("Update account", id, updatedAccount);
  };

  const deleteAccount = async (id) => {
    console.log("Delete account", id);
  };

  return (
    <main className="p-4">
      <div className="flex justify-center">
        <AccountsTable
          accounts={accounts}
          createAccount={createAccount}
          updateAccount={updateAccount}
          deleteAccount={deleteAccount}
        />
      </div>
    </main>
  );
}

function AccountsTable({ accounts, createAccount, updateAccount, deleteAccount }) {
  const [expanded, setExpanded] = useState({});
  const [editMode, setEditMode] = useState({});
  const [newAccount, setNewAccount] = useState({ name: "", parentAccountId: null });

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEditMode = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateAccount = (id, name) => {
    updateAccount(id, { name });
    toggleEditMode(id);
  };

  const renderAccounts = (parentId = null) => {
    return accounts
      .filter((account) => account.parentAccountId === parentId)
      .map((account) => (
        <div key={account.id} className="ml-4">
          <div className="flex items-center">
            <button onClick={() => toggleExpand(account.id)}>
              {expanded[account.id] ? "-" : "+"}
            </button>
            {editMode[account.id] ? (
              <input
                type="text"
                defaultValue={account.name}
                onBlur={(e) => handleUpdateAccount(account.id, e.target.value)}
                autoFocus
              />
            ) : (
              <span onClick={() => toggleEditMode(account.id)}>{account.name}</span>
            )}
            <button onClick={() => deleteAccount(account.id)}>Delete</button>
          </div>
          {expanded[account.id] && renderAccounts(account.id)}
        </div>
      ));
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    createAccount(newAccount);
    setNewAccount({ name: "", parentAccountId: null });
  };

  return (
    <div>
      <form onSubmit={handleCreateAccount} className="mb-4">
        <input
          type="text"
          value={newAccount.name}
          onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
          placeholder="Account Name"
          required
          className="border p-2"
        />
        <select
          value={newAccount.parentAccountId}
          onChange={(e) => setNewAccount({ ...newAccount, parentAccountId: e.target.value })}
          className="border p-2"
        >
          <option value="">Top Level</option>
          {accounts
            .filter((account) => account.parentAccountId === null)
            .map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 ml-2">Add Account</button>
      </form>
      <div>{renderAccounts()}</div>
    </div>
  );
}
