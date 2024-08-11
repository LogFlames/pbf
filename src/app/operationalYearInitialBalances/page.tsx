"use client";

import { InferSelectModel } from "drizzle-orm";
import { ChevronDown, ChevronRight, ChevronsDown } from "lucide-react";
import { useEffect, useState } from "react";
import ButtonWithConfirm from "~/components/buttonWithConfirm";
import Loading from "~/components/loading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { AccountWithChildren, buildAccountTree, findMaxDepth } from "~/lib/utils";
import * as schema from "~/server/db/schema";

export default function operationalYearInitialBalancesPage() {
  const [reloadPage, setReloadPage] = useState(false);
  const [operationalYears, setOperationalYears] = useState<InferSelectModel<typeof schema.operationalYears>[]>([]);
  const [accounts, setAccounts] = useState<InferSelectModel<typeof schema.accounts>[]>([]);
  const [accountMaxDepth, setAccountMaxDepth] = useState<number>(0);
  const [bankAccounts, setBankAccounts] = useState<InferSelectModel<typeof schema.bankAccounts>[]>([]);
  const [operationalYearAccountInitials, setOperationalYearAccountInitials] = useState<InferSelectModel<typeof schema.operationalYearAccountInitials>[]>([]);
  const [operationalYearBankAccountInitials, setOperationalYearBankAccountInitials] = useState<InferSelectModel<typeof schema.operationalYearBankAccountInitials>[]>([]);

  const [filteredOperationalYearAccountInitials, setFilteredOperationalYearAccountInitials] = useState<InferSelectModel<typeof schema.operationalYearAccountInitials>[]>([]);
  const [filteredOperationalYearBankAccountInitials, setFilteredOperationalYearBankAccountInitials] = useState<InferSelectModel<typeof schema.operationalYearBankAccountInitials>[]>([]);

  const [operationalYearAccountInitialPartials, setOperationalYearAccountInitialPartials] = useState<{[key: number]: string}>({});
  const [operationalYearBankAccountInitialPartials, setOperationalYearBankAccountInitialPartials] = useState<{[key: number]: string}>({});

  const [isLoading, setIsLoading] = useState(0);
  const [isAccountDirty, setIsAccountDirty] = useState(false);
  const [isBankAccountDirty, setIsBankAccountDirty] = useState(false);

  const [currentOperationalYear, setCurrentOperationalYear] = useState<number>();

  const [accountTreeOpen, setAccountTreeOpen] = useState<{[key: number]: boolean}>({});

  const [readyForAccountPartials, setReadyForAccountPartials] = useState(false);
  const [readyForBankAccountPartials, setReadyForBankAccountPartials] = useState(false);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/operationalYears", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        alert("Error fetching operational years");
        throw new Error("Error fetching operational years");
      })
      .then(data => {
        setOperationalYears(data.map((item: InferSelectModel<typeof schema.operationalYears>) => {
          return { ...item, startDate: new Date(item.startDate), endDate: new Date(item.endDate) };
        }));
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setIsLoading(prevIsLoading => prevIsLoading - 1);
      });
  }, []);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/accounts", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        alert("Error fetching accounts");
        throw new Error("Error fetching accounts");
      })
      .then(data => {
        setAccounts(data);

        const tree = buildAccountTree(data);
        setAccountMaxDepth(findMaxDepth(tree));
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setIsLoading(prevIsLoading => prevIsLoading - 1);
      });
  }, []);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/bankAccounts", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        alert("Error fetching bank accounts");
        throw new Error("Error fetching bank accounts");
      })
      .then(data => {
        setBankAccounts(data);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setIsLoading(prevIsLoading => prevIsLoading - 1);
      });
  }, []);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/operationalYearAccountInitials", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        alert("Error fetching operational year account initials");
        throw new Error("Error fetching operational year account initials");
      })
      .then(data => {
        setOperationalYearAccountInitials(data);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setIsLoading(prevIsLoading => prevIsLoading - 1);
      });
  }, []);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/operationalYearBankAccountInitials", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        alert("Error fetching operational year bank account initials");
        throw new Error("Error fetching operational year bank account initials");
      })
      .then(data => {
        setOperationalYearBankAccountInitials(data);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setIsLoading(prevIsLoading => prevIsLoading - 1);
      });
  }, []);

  useEffect(() => {
    setCurrentOperationalYear(parseInt(window.localStorage.getItem("operationalYear") ?? ""));
  }, []);

  useEffect(() => {
    setFilteredOperationalYearAccountInitials(operationalYearAccountInitials.filter(item => item.operationalYearId === currentOperationalYear));
    setFilteredOperationalYearBankAccountInitials(operationalYearBankAccountInitials.filter(item => item.operationalYearId === currentOperationalYear));
  }, [currentOperationalYear, operationalYearAccountInitials, operationalYearBankAccountInitials]);

  useEffect(() => {
    if (operationalYearAccountInitials.length > 0 && currentOperationalYear) {
      setReadyForAccountPartials(true);
    }
  }, [operationalYearAccountInitials, currentOperationalYear]);

  useEffect(() => {
    if (operationalYearBankAccountInitials.length > 0 && currentOperationalYear) {
      setReadyForBankAccountPartials(true);
    }
  }, [operationalYearBankAccountInitials, currentOperationalYear]);

  useEffect(() => {
    if (readyForAccountPartials) {
      setOperationalYearAccountInitialPartials(Object.fromEntries(Object.values(operationalYearAccountInitials).filter(item => item.operationalYearId === currentOperationalYear).map(item => [item.accountId, item.initialValue])));
    }
  }, [readyForAccountPartials]);

  useEffect(() => {
    if (readyForBankAccountPartials) {
      setOperationalYearBankAccountInitialPartials(Object.fromEntries(Object.values(operationalYearBankAccountInitials).filter(item => item.operationalYearId === currentOperationalYear).map(item => [item.bankAccountId, item.initialValue])));
    }
  }, [readyForBankAccountPartials]);

  if (!currentOperationalYear || isLoading > 0) {
    return (<Loading />);
  }

  if (isNaN(currentOperationalYear)) {
    if (reloadPage) {
      setReloadPage(false);
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 gap-6 p-6">
        Error: Operational year not selected.
        {!reloadPage &&
          <Button 
            className="m-4" 
            onClick={() => setReloadPage(true)}
            >
              Reload
            </Button>
        }
      </div>
    );
  }

  function renderAccountRows(parentId: number | null, depth: number, tree: { [key: number]: AccountWithChildren }): JSX.Element[] {
    if (Object.keys(tree).length === 0) {
      return [<></>];
    }

    let rows: JSX.Element[] = [];

    for (const item of Object.values(tree).sort((a, b) => a.name.localeCompare(b.name))) {
      rows.push(
        <TableRow key={item.id}>
          {Array.from({ length: depth }, (_, i) => (
            <TableCell key={`before${item.id}-${i}`}>
            </TableCell>
          ))}
          <TableCell>
            {item.children.length > 0 &&
              <Button
                variant="link"
                onClick={() => {
                  setAccountTreeOpen(prevAccountTreeOpen => ({ ...prevAccountTreeOpen, [item.id]: !prevAccountTreeOpen[item.id] }));
                }}
              >
                {accountTreeOpen[item.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            }
          </TableCell>
          <TableCell className="">
            {item.name}
          </TableCell>
          {Array.from({ length: accountMaxDepth - depth }, (_, i) => (
            <TableCell className="" key={`after${item.id}-${i}`}></TableCell>
          ))}
          <TableCell>
            <Input
              type="number"
              value={operationalYearAccountInitialPartials[item.id] ?? ""}
              onChange={(e) => {
                setOperationalYearAccountInitialPartials({
                  ...operationalYearAccountInitialPartials,
                  [item.id]: e.target.value,
                });
                setIsAccountDirty(true);
              }}
              id={`initial__account_${item.id}`}
              className="col-span-1"
            />
          </TableCell>
        </TableRow>);
      if (accountTreeOpen[item.id] && item.children.length > 0) {
        rows = rows.concat(renderAccountRows(item.id, depth + 1, item.children));
      }
    }

    return rows;
  }

  function saveInitialAccountBalances() {
    for (const [accountIdString, value] of Object.entries(operationalYearAccountInitialPartials)) {
      const accountId = parseInt(accountIdString);
      const item = accounts.filter(item => item.id === accountId)[0];
      if (item === undefined) {
        console.error(` account ${accountId} not found`);
        continue;
      }

      if (filteredOperationalYearAccountInitials.filter(init => init.accountId === accountId).length === 0) {
        console.log(`Creating initial account balance for ${accountId}`);
        fetch(`/api/operationalYearAccountInitials`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountId: accountId,
            operationalYearId: currentOperationalYear,
            initialValue: value,
          }),
        }).then(res => {
          if (res.status === 200) {
            return res.json();
          }

          alert("Error saving initial account balance");
          throw new Error("Error saving initial account balance");
        })
          .then(data => {
            setOperationalYearAccountInitials(prevOperationalYearAccountInitials => [...prevOperationalYearAccountInitials, data ]);
          }).catch(err => {
            console.error(err);
            setIsAccountDirty(true);
          });
      } else {
        console.log(`Updating initial account balance for ${accountId}`);
        fetch(`/api/operationalYearAccountInitials/${currentOperationalYear}/${accountId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initialValue: value,
          }),
        }).then(res => {
          if (res.status === 200) {
            return res.json();
          }

          alert("Error saving initial account balance");
          throw new Error("Error saving initial account balance");
        })
          .then(data => {
            setOperationalYearAccountInitials(prevOperationalYearAccountInitials => prevOperationalYearAccountInitials.map(item => item.accountId === accountId && item.operationalYearId === currentOperationalYear ? { ...item, initialValue: value } : item));
          }).catch(err => {
            console.error(err);
            setIsAccountDirty(true);
          });
      }
    }

    setIsAccountDirty(false);
  }

  function saveInitialBankAccountBalances() {
    for (const [bankAccountIdString, value] of Object.entries(operationalYearBankAccountInitialPartials)) {
      const bankAccountId = parseInt(bankAccountIdString);
      const item = bankAccounts.filter(item => item.id === bankAccountId)[0];
      if (item === undefined) {
        console.error(`Bank account ${bankAccountId} not found`);
        continue;
      }

      if (filteredOperationalYearBankAccountInitials.filter(init => init.bankAccountId === bankAccountId).length === 0) {
        console.log(`Creating initial bank account balance for ${bankAccountId}`);
        fetch(`/api/operationalYearBankAccountInitials`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bankAccountId: bankAccountId,
            operationalYearId: currentOperationalYear,
            initialValue: value,
          }),
        }).then(res => {
          if (res.status === 200) {
            return res.json();
          }

          alert("Error saving initial bank account balance");
          throw new Error("Error saving initial bank account balance");
        })
          .then(data => {
            setOperationalYearBankAccountInitials(prevOperationalYearBankAccountInitials => [...prevOperationalYearBankAccountInitials, data ]);
          }).catch(err => {
            console.error(err);
            setIsBankAccountDirty(true);
          });
      } else {
        console.log(`Updating initial bank account balance for ${bankAccountId}`);
        fetch(`/api/operationalYearBankAccountInitials/${currentOperationalYear}/${bankAccountId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initialValue: value,
          }),
        }).then(res => {
          if (res.status === 200) {
            return res.json();
          }

          alert("Error saving initial bank account balance");
          throw new Error("Error saving initial bank account balance");
        })
          .then(data => {
            setOperationalYearBankAccountInitials(prevOperationalYearBankAccountInitials => prevOperationalYearBankAccountInitials.map(item => item.bankAccountId === bankAccountId && item.operationalYearId === currentOperationalYear ? { ...item, initialValue: value } : item));
          }).catch(err => {
            console.error(err);
            setIsBankAccountDirty(true);
          });
      }
    }

    setIsBankAccountDirty(false);
  }

  function resetInitialBankAccountBalances() {
    for (const item of filteredOperationalYearBankAccountInitials) {
      fetch(`/api/operationalYearBankAccountInitials/${currentOperationalYear}/${item.bankAccountId}`, {
        method: "DELETE",
      }).then(res => {
        if (res.status === 200) {
          return res.json();
        }

        alert("Error deleting initial bank account balance");
        throw new Error("Error deleting initial bank account balance");
      })
        .then(data => {
          setOperationalYearBankAccountInitials(prevOperationalYearBankAccountInitials => prevOperationalYearBankAccountInitials.filter(init => init.bankAccountId !== item.bankAccountId && init.operationalYearId !== currentOperationalYear));
        }).catch(err => {
          console.error(err);
        });
      operationalYearBankAccountInitialPartials[item.bankAccountId] = "";
    }
  }

  function resetInitialAccountBalances() {
    for (const item of filteredOperationalYearAccountInitials) {
      fetch(`/api/operationalYearAccountInitials/${currentOperationalYear}/${item.accountId}`, {
        method: "DELETE",
      }).then(res => {
        if (res.status === 200) {
          return res.json();
        }

        alert("Error deleting initial account balance");
        throw new Error("Error deleting initial account balance");
      })
        .then(data => {
          setOperationalYearAccountInitials(prevOperationalYearAccountInitials => prevOperationalYearAccountInitials.filter(init => init.accountId !== item.accountId && init.operationalYearId !== currentOperationalYear));
        }).catch(err => {
          console.error(err);
        });

      operationalYearAccountInitialPartials[item.accountId] = "";
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 gap-6 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Initial Balances {isAccountDirty || isBankAccountDirty ? "*" : ""}</h1>
      </div>
      <div className="flex flex-col gap-4">
        <Accordion type="multiple" defaultValue={["accounts", "bankAccounts"]}>
          <AccordionItem value="accounts" className="">
            <AccordionTrigger>Accounts</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 rouded-md bg-muted/40 p-4 mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Name</TableHead>
                      {Array.from({ length: accountMaxDepth + 1 }, (_, i) => (
                        <TableHead className="" key={`header${i}`}></TableHead>
                      ))}
                      <TableHead className="w-full">Initial Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    { renderAccountRows(null, 0, buildAccountTree(accounts)) }
                  </TableBody>
                </Table>
                <div className="flex gap-4 flex-col md:flex-row">
                  <Button
                    className="mt-4 md:w-[60px]"
                    variant="link"
                    onClick={() => setAccountTreeOpen(Object.fromEntries(Object.values(accounts).map(item => [item.id, true])))}
                    title="Expand all accounts"
                  >
                    <ChevronsDown className="" />
                  </Button>
                  <Button className="mt-4 md:w-[250px]" onClick={saveInitialAccountBalances} disabled={!isAccountDirty}>Save</Button>
                  <ButtonWithConfirm
                    title="Reset Account Balances"
                    description="This action cannot be undone. This will reset all intial balances for all accounts."
                    confirmText="Confirm Reset"
                    cancelText="Cancel"
                    triggerText="Reset"
                    triggerClassName="mt-4 md:w-[250px]"
                    triggerDisabled={filteredOperationalYearAccountInitials.length === 0}
                    onConfirm={resetInitialAccountBalances}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="bankAccounts" className="">
            <AccordionTrigger>Bank Accounts</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 rouded-md bg-muted/40 p-4 mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="">Name</TableHead>
                      <TableHead className="">Bank</TableHead>
                      <TableHead className="">Bank Account Number</TableHead>
                      <TableHead className="">Initial Balance</TableHead>
                      <TableHead className=""></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-medium">{item.bank}</TableCell>
                        <TableCell className="font-medium">{item.clearingNumber} - {item.accountNumber}</TableCell>
                        <TableCell className="font-medium">
                          <Input
                            type="number"
                            value={operationalYearBankAccountInitialPartials[item.id] ?? ""}
                            onChange={(e) => {
                              setOperationalYearBankAccountInitialPartials({
                                ...operationalYearBankAccountInitialPartials,
                                [item.id]: e.target.value,
                              });
                              setIsBankAccountDirty(true);
                            }}
                            id={`initial_bank_account_${item.id}`}
                            className="col-span-1"
                          />
                        </TableCell>
                        <TableCell className=""></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex gap-4 flex-col md:flex-row">
                  <Button className="mt-4 md:w-[250px]" onClick={saveInitialBankAccountBalances} disabled={!isBankAccountDirty}>Save</Button>
                  <ButtonWithConfirm
                    title="Reset Bank Account Balances"
                    description="This action cannot be undone. This will reset all intial balances for all bank accounts."
                    confirmText="Confirm Reset"
                    cancelText="Cancel"
                    triggerText="Reset"
                    triggerClassName="mt-4 md:w-[250px]"
                    triggerDisabled={filteredOperationalYearBankAccountInitials.length === 0}
                    onConfirm={resetInitialBankAccountBalances}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main >
  );
}

