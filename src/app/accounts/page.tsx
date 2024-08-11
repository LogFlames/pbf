"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import { ChevronDown, ChevronRight, ChevronsDown, MoreHorizontal, PencilIcon, PlusIcon, Trash, XIcon } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { AccountWithChildren, buildAccountTree, cn, findMaxDepth } from "~/lib/utils";
import * as schema from "~/server/db/schema";

const newAccountFormSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character long").max(255, "Name cannot be more than 255 characters long"),
  description: z.string(),
  parentAccountId: z.string().nullable(),
});

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<InferSelectModel<typeof schema.accounts>[]>([]);
  const [deleteAccountOpenId, setDeleteAccountOpenId] = useState<number | null>(null);
  const [editAccountOpenId, setEditAccountOpenId] = useState<number | null>(null);
  const [newAccountOpen, setNewAccountOpen] = useState(false);

  const [editAccountPartialName, setEditAccountPartialName] = useState("");
  const [editAccountPartialDescription, setEditAccountPartialDescription] = useState("");
  const [editAccountPartialParentAccountId, setEditAccountPartialParentAccountId] = useState("");

  const [hoveredRowAccountId, setHoveredRowAccountId] = useState<number | null>(null);

  const [accountTreeOpen, setAccountTreeOpen] = useState<{[key: number]: boolean}>({});
  const [accountMaxDepth, setAccountMaxDepth] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(0);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/accounts", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        console.error("Error fetching accounts");
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
    const tree = buildAccountTree(accounts);
    setAccountMaxDepth(findMaxDepth(tree));

    setAccountTreeOpen(Object.fromEntries(Object.values(accounts).map(item => {
      const currentState = accountTreeOpen[item.id];
      return [item.id, currentState ?? false];
    })));
  }, [accounts]);

  const newAccontForm = useForm<z.infer<typeof newAccountFormSchema>>({
    resolver: zodResolver(newAccountFormSchema),
    defaultValues: {
      name: "",
      description: "",
      parentAccountId: null,
    },
  });

  function newAccountOnSubmit(data: z.infer<typeof newAccountFormSchema>) {
    const parsedParentAccountId = parseInt(data.parentAccountId ?? "");
    const parsedData = { ...data, parentAccountId: isNaN(parsedParentAccountId) ? null : parsedParentAccountId };

    setNewAccountOpen(false);
    newAccontForm.reset();
    console.log("submitted")
    fetch("/api/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData),
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error creating  account, possible foreign key constraint violation");
      throw new Error("Error creating  account, possible foreign key constraint violation");
    })
      .then(data => {
        setAccounts(prevAccounts => [...prevAccounts, data]);
      }).catch(err => {
        console.error(err);
      });
  }

  function deleteAccount(id: number) {
    setDeleteAccountOpenId(null);

    fetch(`/api/accounts/${id}`, {
      method: "DELETE",
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error deleting account, possible foreign key constraint violation");
      throw new Error("Error deleting  account, possible foreign key constraint violation");
    })
      .then(data => {
        setAccounts(prevAccounts => prevAccounts.filter(item => item.id !== id));
      }).catch(err => {
        console.error(err);
      });
  }

  function updateAccount(id: number, newData: z.infer<typeof newAccountFormSchema>) {
    setEditAccountOpenId(null);

    const parsedParentAccountId = parseInt(newData.parentAccountId ?? "");
    const parsedData = { ...newData, parentAccountId: isNaN(parsedParentAccountId) ? null : parsedParentAccountId };

    fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData),
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error updating account, possible foreign key constraint violation or cyclic account relationship");
      throw new Error("Error updating account, possible foreign key constraint violation or cyclic account relationship");
    })
      .then(data => {
        setAccounts(prevAccounts => prevAccounts.map(item => item.id === id ? { ...item, ...parsedData } : item));
      }).catch(err => {
        console.error(err);
      });
  }

  function renderAccountRows(parentId: number | null, depth: number, tree: { [key: number]: AccountWithChildren }): JSX.Element[] {
    if (Object.keys(tree).length === 0) {
      return [<></>];
    }

    let rows: JSX.Element[] = [];

    for (const item of Object.values(tree).sort((a, b) => a.name.localeCompare(b.name))) {
      rows.push(
        <TableRow
          key={item.id}
          onMouseEnter={() => { setHoveredRowAccountId(item.id) }}
          onMouseLeave={() => { setHoveredRowAccountId(prevHoveredRowAccountId => prevHoveredRowAccountId === item.id ? null : prevHoveredRowAccountId) }}
        >
          {Array.from({ length: depth }, (_, i) => (
            <TableCell key={`before${item.id}-${i}`}>
            </TableCell>
          ))}
          <TableCell className="max-w-[50px]">
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
          <TableCell className="max-w-[50px] whitespace-nowrap">
            {item.name}
            <span className="text-muted-foreground ml-2">
              {item.description ? `(${item.description})` : null}
            </span>
          </TableCell>
          {Array.from({ length: accountMaxDepth - depth }, (_, i) => (
            <TableCell className="" key={`after${item.id}-${i}`}></TableCell>
          ))}
          <TableCell className="text-right">
            <Button
              variant="link"
              className="p-0"
              onClick={() => {
                newAccontForm.setValue("parentAccountId", item.id.toString());
                setNewAccountOpen(true);
              }}
              title="Create Sub-Account"
            >
              <PlusIcon 
              className={cn("h-6 w-6 bg-primary/60 text-primary hover:bg-primary/40 transition-all rounded-md ml-2 transition-opacity duration-300", hoveredRowAccountId === item.id ? "opacity-100" : "opacity-0" )}
              size={30} />
            </Button>
          </TableCell>
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
                    setEditAccountPartialName(item.name);
                    setEditAccountPartialParentAccountId(item.parentAccountId ? item.parentAccountId.toString() : "");
                    setEditAccountOpenId(item.id)
                  }}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => setDeleteAccountOpenId(item.id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>);
      if (accountTreeOpen[item.id] && item.children.length > 0) {
        rows = rows.concat(renderAccountRows(item.id, depth + 1, item.children));
      }
    }

    return rows;
  }

  if (isLoading > 0) {
    return (<Loading />);
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 gap-6 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Accounts</h1>
        <Dialog open={newAccountOpen} onOpenChange={(isOpen) => {
          setNewAccountOpen(isOpen);
          if (!isOpen) newAccontForm.reset();
        }}>
          <DialogTrigger>
            <PlusIcon className="h-6 w-6 bg-primary/60 text-primary hover:bg-primary/40 transition-all rounded-md ml-2" />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>New  Account</DialogTitle>
            <Form {...newAccontForm}>
              <form onSubmit={newAccontForm.handleSubmit(newAccountOnSubmit)} className="space-y-4">
                <FormField
                  control={newAccontForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Account name" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Name of the  account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newAccontForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Account description" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Description for the account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newAccontForm.control}
                  name="parentAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Account</FormLabel>
                      <FormControl>
                        <div className="flex flex-row">

                          <Select
                            disabled={field.disabled}
                            name={field.name}
                            onOpenChange={(isOpen) => { if (!isOpen) field.onBlur() }}
                            onValueChange={(value) => {
                              console.log(value);
                              field.onChange(value);
                            }}
                            value={field.value ?? ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a parent account (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="link"
                            className=""
                            onClick={(e) => {
                              field.onChange(null);
                              e.preventDefault();
                            }}
                          >
                            <XIcon />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription hidden>
                        Parent account of the account. Possible to be null. 
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  Submit
                </Button>
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
                <TableHead className=""></TableHead>
                <TableHead className="w-[50px]">Name</TableHead>
                {Array.from({ length: accountMaxDepth }, (_, i) => (
                  <TableHead className="" key={`header_after${i}`}></TableHead>
                ))}
                <TableHead className="w-full text-right"></TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderAccountRows(null, 0, buildAccountTree(accounts))}
            </TableBody>
          </Table>
          <Button
            variant="link"
            onClick={() => setAccountTreeOpen(Object.fromEntries(Object.values(accounts).map(item => [item.id, true])))}
            title="Expand all accounts"
          >
            <ChevronsDown />
          </Button>
          {accounts.map((item) => (
            <AlertDialog key={item.id} open={deleteAccountOpenId === item.id} onOpenChange={(isOpen) => { if (!isOpen) setDeleteAccountOpenId(null); }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete  account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteAccountOpenId(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteAccount(item.id)}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
          {accounts.map((item) => {
            return (
              <Dialog key={item.id} open={editAccountOpenId === item.id} onOpenChange={(isOpen) => { if (!isOpen) setEditAccountOpenId(null); }}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-[1fr_1fr_1fr_30px] items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Account name"
                        defaultValue={item.name}
                        onChange={(e) => setEditAccountPartialName(e.target.value)}
                        className="col-span-3"
                      />
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Account description"
                        defaultValue={item.description ?? ""}
                        onChange={(e) => setEditAccountPartialDescription(e.target.value)}
                        className="col-span-3"
                      />
                      <Label htmlFor="" className="text-right">
                        Parent Account
                      </Label>
                      <Select onValueChange={(value) => { setEditAccountPartialParentAccountId(value ?? ""); }} value={editAccountPartialParentAccountId}>
                        <SelectTrigger className="col-span-2">
                          <SelectValue placeholder="Select a parent account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="link"
                        type="button"
                        className="p-0"
                        onClick={(e) => {
                          setEditAccountPartialParentAccountId("");
                          e.preventDefault();
                        }}
                      >
                        <XIcon className="p-0 m-0" size={30} />
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      updateAccount(item.id, {
                        name: editAccountPartialName,
                        description: editAccountPartialDescription,
                        parentAccountId: editAccountPartialParentAccountId,
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
