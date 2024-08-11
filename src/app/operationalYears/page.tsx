"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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

const newOperationalYearFormSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 character long").max(255, "Name cannot be more than 255 characters long"),
  startDate: z.string().min(1, "You must pick a start date"),
  endDate: z.string().min(1, "You must pick an end date"),
});

export default function OperationalYearsPage() {
  const [operationalYears, setOperationalYears] = useState<InferSelectModel<typeof schema.operationalYears>[]>([]);
  const [deleteOperationalYearOpenId, setDeleteOperationalYearOpenId] = useState<number | null>(null);
  const [editOperationalYearOpenId, setEditOperationalYearOpenId] = useState<number | null>(null);
  const [newOperationalYearOpen, setNewOperationalYearOpen] = useState(false);

  const [editOperationalYearPartialName, setEditOperationalYearPartialName] = useState("");
  const [editOperationalYearPartialStartDate, setEditOperationalYearPartialStartDate] = useState("");
  const [editOperationalYearPartialEndDate, setEditOperationalYearPartialEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(0);

  useEffect(() => {
    setIsLoading(prevIsLoading => prevIsLoading + 1);
    fetch("/api/operationalYears", { method: "GET" })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        }

        console.error("Error fetching operational years");
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

  const newOperationalYearForm = useForm<z.infer<typeof newOperationalYearFormSchema>>({
    resolver: zodResolver(newOperationalYearFormSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
    },
  });

  function newOperationalYearOnSubmit(data: z.infer<typeof newOperationalYearFormSchema>) {
    setNewOperationalYearOpen(false);
    newOperationalYearForm.reset();
    fetch("/api/operationalYears", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error creating operational year");
      throw new Error("Error creating operational year");
    })
      .then(data => {
        setOperationalYears([...operationalYears, { ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate)}]);
      }).catch(err => {
        console.error(err);
      });
  }

  function deleteOperationalYear(id: number) {
    setDeleteOperationalYearOpenId(null);

    fetch(`/api/operationalYears/${id}`, {
      method: "DELETE",
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error deleting operational year, possible foreign key constraint violation");
      throw new Error("Error deleting operational year");
    })
      .then(data => {
        setOperationalYears(operationalYears.filter(item => item.id !== id));
      }).catch(err => {
        console.error(err);
      });
  }

  function updateOperationalYear(id: number, newData: z.infer<typeof newOperationalYearFormSchema>) {
    setEditOperationalYearOpenId(null);

    fetch(`/api/operationalYears/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }

      alert("Error updating operational year");
      throw new Error("Error updating operational year");
    })
      .then(data => {
        const convertedData: {
          name: string;
          startDate?: Date;
          endDate?: Date;
        } = {
          name: newData.name,
        }

        if (newData.startDate) {
          convertedData.startDate = new Date(newData.startDate);
        }

        if (newData.endDate) {
          convertedData.endDate = new Date(newData.endDate);
        }

        setOperationalYears(operationalYears.map(item => item.id === id ? { ...item, ...convertedData } : item));
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
        <h1 className="text-lg font-semibold md:text-2xl">Operational Years</h1>
        <Dialog open={newOperationalYearOpen} onOpenChange={(isOpen) => {
          setNewOperationalYearOpen(isOpen);
          if (!isOpen) newOperationalYearForm.reset();
        }}>
          <DialogTrigger>
            <PlusIcon className="h-6 w-6 bg-primary/60 text-primary hover:bg-primary/40 transition-all rounded-md ml-2" />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>New Operational Year</DialogTitle>
            <Form {...newOperationalYearForm}>
              <form onSubmit={newOperationalYearForm.handleSubmit(newOperationalYearOnSubmit)} className="space-y-4">
                <FormField
                  control={newOperationalYearForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="20xx" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Name of the operational year.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newOperationalYearForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        Start date of the operational year.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newOperationalYearForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription hidden>
                        End date of the operational year.
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
                <TableHead className="">Start Date</TableHead>
                <TableHead className="">End Date</TableHead>
                <TableHead className=""></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operationalYears.sort((a, b) => a.name.localeCompare(b.name)).map((item) => {
                console.log(typeof item.startDate);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-medium">{format(item.startDate, "yyyy-MM-dd")}</TableCell>
                    <TableCell className="font-medium">{format(item.endDate, "yyyy-MM-dd")}</TableCell>
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
                              setEditOperationalYearPartialName(item.name);
                              setEditOperationalYearPartialStartDate(format(item.startDate, "yyyy-MM-dd"));
                              setEditOperationalYearPartialEndDate(format(item.endDate, "yyyy-MM-dd"));
                              setEditOperationalYearOpenId(item.id)
                            }}
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => setDeleteOperationalYearOpenId(item.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
              )})}
            </TableBody>
          </Table>
          {operationalYears.map((item) => (
            <AlertDialog key={item.id} open={deleteOperationalYearOpenId === item.id} onOpenChange={(isOpen) => { if (!isOpen) setDeleteOperationalYearOpenId(null); }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete operational year?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteOperationalYearOpenId(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteOperationalYear(item.id)}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
          {operationalYears.map((item) => {

            return (
              <Dialog key={item.id} open={editOperationalYearOpenId === item.id} onOpenChange={(isOpen) => { if (!isOpen) setEditOperationalYearOpenId(null); }}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Operational Year</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="20xx"
                        defaultValue={item.name}
                        onChange={(e) => setEditOperationalYearPartialName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="startDate" className="text-right">
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        defaultValue={format(item.startDate, "yyyy-MM-dd")}
                        onChange={(e) => setEditOperationalYearPartialStartDate(e.target.value)}
                        id="startDate"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="endDate" className="text-right">
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        defaultValue={format(item.endDate, "yyyy-MM-dd")}
                        onChange={(e) => setEditOperationalYearPartialEndDate(e.target.value)}
                        id="endDate"
                        className="col-span-3"
                      />
                    </div>

                  </div>
                  <DialogFooter>
                    <Button onClick={() => {
                      updateOperationalYear(item.id, {
                        name: editOperationalYearPartialName,
                        startDate: editOperationalYearPartialStartDate,
                        endDate: editOperationalYearPartialEndDate,
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
