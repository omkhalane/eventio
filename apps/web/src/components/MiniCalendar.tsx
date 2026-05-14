import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { motion } from 'motion/react';
import React from 'react';

import { cn } from '../lib/utils';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

export default function MiniCalendar({
  selectedDate,
  onDateSelect,
  currentMonth,
  setCurrentMonth: _setCurrentMonth,
}: MiniCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-card w-full">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="text-muted-foreground/50 py-1 text-center text-[11px] font-semibold"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, _idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(day)}
              className={cn(
                'group relative flex h-9 w-9 items-center justify-center rounded-full border text-[11px] transition-all',
                // Base background and text colors - White background, black bold text
                'bg-white font-black text-black',

                // Today (Golden Border)
                isTodayDate && 'z-10 border-amber-500 text-amber-600',

                // Selected (Black Border)
                isSelected && 'z-20 border-black shadow-sm',

                // Non-current month styling
                !isCurrentMonth && 'opacity-20',
              )}
            >
              {format(day, 'd')}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
