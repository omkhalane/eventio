import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

export default function MiniCalendar({ selectedDate, onDateSelect, currentMonth, setCurrentMonth }: MiniCalendarProps) {
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
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div key={`${day}-${i}`} className="text-center text-[11px] font-semibold text-muted-foreground/50 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(day)}
              className={cn(
                "h-9 w-9 flex items-center justify-center text-[11px] rounded-full transition-all relative group border",
                // Base background and text colors - White background, black bold text
                "bg-white text-black font-black",
                
                // Today (Golden Border)
                isTodayDate && "border-amber-500 z-10 text-amber-600",
                
                // Selected (Black Border)
                isSelected && "border-black z-20 shadow-sm",
                
                // Non-current month styling
                !isCurrentMonth && "opacity-20"
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
