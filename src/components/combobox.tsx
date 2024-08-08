"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { cn } from "~/lib/utils";

export function Combobox(props: { options: { value: string; label: string }[], width: string, selectText: string, searchText: string, noFoundText: string, deselectable: boolean}) {
  if (!props.deselectable && (!props.options || props.options.length < 1)) {
    return (<></>);
  }

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(props.deselectable ? "" : props.options[0]?.value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between ${props.width}`}
        >
          {value
            ? props.options.find((item) => item.value === value)?.label
            : props.selectText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`p-0 ${props.width}`}>
        <Command>
          <CommandInput placeholder={props.searchText} />
          <CommandList>
            <CommandEmpty>{props.noFoundText}</CommandEmpty>
            <CommandGroup>
              {props.options.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value && props.deselectable ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}