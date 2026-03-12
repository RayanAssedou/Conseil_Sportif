"use client";

import { getDateOffset, getShortDate } from "@/lib/utils";

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const dates = Array.from({ length: 7 }, (_, i) => i - 3).map((offset) => {
    const date = getDateOffset(offset);
    return { date, label: getShortDate(date), offset };
  });

  const today = getDateOffset(0);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-3 px-1 scrollbar-hide">
      {dates.map(({ date, label }) => {
        const isSelected = date === selectedDate;
        const isToday = date === today;
        return (
          <button
            key={date}
            onClick={() => onDateChange(date)}
            className={`
              relative flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${isSelected
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text border border-border"
              }
            `}
          >
            {label}
            {isToday && !isSelected && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
