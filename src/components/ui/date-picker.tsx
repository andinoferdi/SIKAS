"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, placeholder = "Select date", className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [currentMonth, setCurrentMonth] = React.useState(value ? new Date(value) : new Date())

    const selectedDate = value ? new Date(value) : null

    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const formatToLocalDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const handleDayClick = (day: number) => {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const formattedDate = formatToLocalDate(newDate)
      onChange?.(formattedDate)
      setIsOpen(false)
    }

    const handlePrevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const handleNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    return (
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3 bg-card border border-input-border rounded-lg cursor-pointer hover:border-input-focus transition-colors",
            className,
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-5 h-5 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span
            className={cn("flex-1 text-sm", selectedDate ? "text-text-primary font-medium" : "text-text-placeholder")}
          >
            {selectedDate ? formatDate(value!) : placeholder}
          </span>
          <input ref={ref} type="hidden" value={value || ""} onChange={(e) => onChange?.(e.target.value)} />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-card-border rounded-lg shadow-lg z-50 p-4 min-w-80">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </button>
              <h3 className="text-sm font-semibold text-text-primary">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-text-muted h-8 flex items-center justify-center"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                const dateString = formatToLocalDate(date)
                const isSelected = selectedDate && dateString === value
                const isToday = formatToLocalDate(new Date()) === dateString

                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "h-8 rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md"
                        : isToday
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-text-primary hover:bg-muted",
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  },
)

DatePicker.displayName = "DatePicker"
