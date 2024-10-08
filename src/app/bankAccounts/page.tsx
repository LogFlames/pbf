"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import { MoreHorizontal, PencilIcon, PlusIcon, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Loading from "~/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import * as schema from "~/server/db/schema";

const newBankAccountFormSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character long").max(255, "Name cannot be more than 255 characters long"),
  bank: z.string().min(1, "Bank must be at least 1 character long").max(255, "Bank cannot be more than 255 characters long"),
  clearingNumber: z.string().min(4, "Clearing number must 4 characters long").max(4, "Clearing number must be 4 characters long"),
  accountNumber: z.string().min(1, "Account number must be at least 1 character long").max(32, "Account number cannot be more than 32 characters long"),
});

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<InferSelectModel<typeof schema.bankAccounts>[]>([]);
  const [deleteBankAccountOpenId, setDeleteBankAccountOpenId] = useState<number | null>(null);
  const [editBankAccountOpenId, setEditBankAccountOpenId] = useState<number | null>(null);
  const [newBankAccountOpen, setNewBankAccountOpen] = useState(false);

  const [editBankAccountPartialName, setEditBankAccountPartialName] = useState("");
  const [editBankAccountPartialBank, setEditBankAccountPartialBank] = useState("");
  const [editBankAccountPartialClearingNumber, setEditBankAccountPartialClearingNumber] = useState("");
  const [editBankAccountPartialAccountNumber, setEditBankAccountPartialAccountNumber] = useState("");

  const [isLoading, setIsLoading] = useState(0);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/bankAccounts", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        console.error("Error fetching bank accounts");
      })
      .then(data => {
        setBankAccounts(data);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setIsLoading(prevIsLoading => prevIsLoading - 1);
      });
  }, []);

  const newBankAccontForm = useForm<z.infer<typeof newBankAccountFormSchema>>({
    resolver: zodResolver(newBankAccountFormSchema),
    defaultValues: {
      name: "",
      bank: "",
      clearingNumber: "",
      accountNumber: "",
    },
  });

  function newBankAccountOnSubmit(data: z.infer<typeof newBankAccountFormSchema>) {
    setNewBankAccountOpen(false);
    newBankAccontForm.reset();
    fetch("/api/bankAccounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error creating bank account");
      throw new Error("Error creating bank account");
    })
      .then(data => {
        setBankAccounts(prevBankAccounts => [...prevBankAccounts, data]);
      }).catch(err => {
        console.error(err);
      });
  }

  function deleteBankAccount(id: number) {
    setDeleteBankAccountOpenId(null);

    fetch(`/api/bankAccounts/${id}`, {
      method: "DELETE",
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error deleting bank account, possible foreign key constraint violation");
      throw new Error("Error deleting bank account, possible foreign key constraint violation");
    })
      .then(data => {
        setBankAccounts(prevBankAccounts => prevBankAccounts.filter(item => item.id !== id));
      }).catch(err => {
        console.error(err);
      });
  }

  function updateBankAccount(id: number, newData: z.infer<typeof newBankAccountFormSchema>) {
    setEditBankAccountOpenId(null);

    fetch(`/api/bankAccounts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error updating bank account");
      throw new Error("Error updating bank account");
    })
      .then(data => {
        setBankAccounts(prevBankAccounts => prevBankAccounts.map(item => item.id === id ? { ...item, ...newData } : item));
      }).catch(err => {
        console.error(err);
      });
  }

  if (isLoading > 0) {
    return (<Loading />);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 gap-6 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Bank Accounts</h1>
        <Dialog open={newBankAccountOpen} onOpenChange={(isOpen) => {
          setNewBankAccountOpen(isOpen);
          if (!isOpen) newBankAccontForm.reset();
        }}>
          <DialogTrigger>
            <PlusIcon className="h-6 w-6 bg-primary/60 text-primary hover:bg-primary/40 transition-all rounded-md ml-2" />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>New Bank Account</DialogTitle>
            <Form {...newBankAccontForm}>
              <form onSubmit={newBankAccontForm.handleSubmit(newBankAccountOnSubmit)} className="space-y-4">
                <FormField
                  control={newBankAccontForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank account name" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Name of the bank account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newBankAccontForm.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank name" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Name of the bank.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newBankAccontForm.control}
                  name="clearingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clearing Number</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="xxxx" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Clearing number of the bank account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newBankAccontForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="xxx xxx xxx" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Account number of the bank account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex flex-row pb-4">
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">Name</TableHead>
                <TableHead className="">Bank</TableHead>
                <TableHead className="">Bank Account Number</TableHead>
                <TableHead className=""></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="font-medium">{item.bank}</TableCell>
                  <TableCell className="font-medium">{item.clearingNumber} - {item.accountNumber}</TableCell>
                  <TableCell className="font-medium text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditBankAccountPartialName(item.name);
                            setEditBankAccountPartialBank(item.bank);
                            setEditBankAccountPartialClearingNumber(item.clearingNumber);
                            setEditBankAccountPartialAccountNumber(item.accountNumber);
                            setEditBankAccountOpenId(item.id)
                          }}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => setDeleteBankAccountOpenId(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {bankAccounts.map((item) => (
            <AlertDialog key={item.id} open={deleteBankAccountOpenId === item.id} onOpenChange={(isOpen) => { if (!isOpen) setDeleteBankAccountOpenId(null); }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete bank account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteBankAccountOpenId(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteBankAccount(item.id)}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
          {bankAccounts.map((item) => {

            return (
              <Dialog key={item.id} open={editBankAccountOpenId === item.id} onOpenChange={(isOpen) => { if (!isOpen) setEditBankAccountOpenId(null); }}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Bank Account</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Bank account name"
                        defaultValue={item.name}
                        onChange={(e) => setEditBankAccountPartialName(e.target.value)}
                        className="col-span-3"
                      />
                      <Label htmlFor="bank" className="text-right">
                        Bank
                      </Label>
                      <Input
                        id="bank"
                        placeholder="Bank name"
                        defaultValue={item.bank}
                        onChange={(e) => setEditBankAccountPartialBank(e.target.value)}
                        className="col-span-3"
                      />
                      <Label htmlFor="clearingNumber" className="text-right">
                        Clearing Number
                      </Label>
                      <Input
                        id="clearingNumber"
                        placeholder="xxxx"
                        type="number"
                        defaultValue={item.clearingNumber}
                        onChange={(e) => setEditBankAccountPartialClearingNumber(e.target.value)}
                        className="col-span-3"
                      />
                      <Label htmlFor="accountNumber" className="text-right">
                        Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        placeholder="xxx xxx xxx"
                        type="number"
                        defaultValue={item.accountNumber}
                        onChange={(e) => setEditBankAccountPartialAccountNumber(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      updateBankAccount(item.id, {
                        name: editBankAccountPartialName,
                        bank: editBankAccountPartialBank,
                        clearingNumber: editBankAccountPartialClearingNumber,
                        accountNumber: editBankAccountPartialAccountNumber,
                      });
                    }}>
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>
      </div>
    </main >
  );
}
