"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "~/lib/utils"
import { Button } from "./ui/button"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export function DatePicker(params: { onChange?: (value: { target: { value: Date } }) => void, value?: Date, onBlur?: () => void, disabled?: boolean, defaultValue?: Date, id?: string, className?: string }) {
  const [date, setDate] = useState<Date | undefined>(params.defaultValue);

  return (
    <div id={params.id} className={params.className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(day) => {
              setDate(day);
              if (day && params.onChange) {
                params.onChange({ target: { value: day } });
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
