"use client";

import { set } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
import { useEffect, useState } from "react";
import Loading from "~/components/loading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import * as schema from "~/server/db/schema";

export default function operationalYearInitialBalancesPage() {
  const [reloadPage, setReloadPage] = useState(false);
  const [operationalYears, setOperationalYears] = useState<InferSelectModel<typeof schema.operationalYears>[]>([]);
  const [accounts, setAccounts] = useState<InferSelectModel<typeof schema.accounts>[]>([]);
  const [bankAccounts, setBankAccounts] = useState<InferSelectModel<typeof schema.bankAccounts>[]>([]);
  const [operationalYearAccountInitials, setOperationalYearAccountInitials] = useState<InferSelectModel<typeof schema.operationalYearAccountInitials>[]>([]);
  const [operationalYearBankAccountInitials, setOperationalYearBankAccountInitials] = useState<InferSelectModel<typeof schema.operationalYearBankAccountInitials>[]>([]);

  const [operationalYearAccountInitialPartials, setOperationalYearAccountInitialPartials] = useState<{[key: number]: string}>({});
  const [operationalYearBankAccountInitialPartials, setOperationalYearBankAccountInitialPartials] = useState<{[key: number]: string}>({});

  const [isLoading, setIsLoading] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

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

  const currentOperationalYear = parseInt(window.localStorage.getItem("operationalYear") ?? "");
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

  if (isLoading > 0) {
    return (<Loading />);
  }

  const filteredOperationalYearAccountInitials = operationalYearAccountInitials.filter(item => item.operationalYearId === currentOperationalYear);
  const filteredOperationalYearBankAccountInitials = operationalYearBankAccountInitials.filter(item => item.operationalYearId === currentOperationalYear);

  function saveInitialAccountBalances() {
    let anyFailed = false;
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
            setOperationalYearBankAccountInitials(operationalYearBankAccountInitials.map(item => item.bankAccountId === bankAccountId && item.operationalYearId === currentOperationalYear ? { ...item, initialValue: value } : item));
          }).catch(err => {
            console.error(err);
            anyFailed = true;
          });
      }
    }

    if (!anyFailed) {
      setIsDirty(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 gap-6 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Initial Balances {isDirty ? "*" : ""}</h1>
      </div>
      <div className="flex flex-col gap-4">
        <Accordion type="multiple" defaultValue={["accounts", "bankAccounts"]}>
          <AccordionItem value="accounts" className="">
            <AccordionTrigger>Accounts</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 rouded-md bg-muted/40 p-4 mt-4">
                {accounts.map((item) => (
                  <div key={item.id}>
                    <div className="grid grid-cols-[300px_200px_1fr] items-center gap-4">
                      <Label htmlFor={`initial__account_${item.id}`} className="text-right">
                        {item.name}
                      </Label>
                      <Input
                        type="number"
                        defaultValue={filteredOperationalYearAccountInitials.filter(init => init.accountId === item.id && init.operationalYearId === currentOperationalYear)[0]?.initialValue ?? "0"}
                        onChange={(e) => {
                          setOperationalYearAccountInitialPartials({
                            ...operationalYearAccountInitialPartials,
                            [item.id]: e.target.value,
                          });
                          setIsDirty(true);
                        }}
                        id={`initial__account_${item.id}`}
                        className="col-span-1"
                      />
                    </div>
                  </div>
                ))}
                <Button className="mt-4 w-[500px]" onClick={saveInitialAccountBalances}>Save</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="bankAccounts" className="">
            <AccordionTrigger>Bank Accounts</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4 rouded-md bg-muted/40 p-4 mt-4">
                {bankAccounts.map((item) => (
                  <div key={item.id}>
                    <div className="grid grid-cols-[300px_200px_1fr] items-center gap-4">
                      <Label htmlFor={`initial_bank_account_${item.id}`} className="text-right">
                        {item.name} ({item.clearingNumber} - {item.accountNumber})
                      </Label>
                      <Input
                        type="number"
                        defaultValue={filteredOperationalYearBankAccountInitials.filter(init => init.bankAccountId === item.id && init.operationalYearId === currentOperationalYear)[0]?.initialValue ?? "0"}
                        onChange={(e) => {
                          setOperationalYearBankAccountInitialPartials({
                            ...operationalYearBankAccountInitialPartials,
                            [item.id]: e.target.value,
                          });
                          setIsDirty(true);
                        }}
                        id={`initial_bank_account_${item.id}`}
                        className="col-span-1"
                      />
                    </div>
                  </div>
                ))}
                <Button className="mt-4 w-[500px]" onClick={saveInitialBankAccountBalances}>Save</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main >
  );
}

