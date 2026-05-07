import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  Terminal,
  Trophy,
  Users,
  Video,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useMemo } from 'react';

import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { CalendarEvent, FilterState, ViewMode } from '../types';

interface MainCalendarProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  searchQuery: string;
  filters: FilterState;
  isLoading?: boolean;
}

const getPlatformColor = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('codeforces')) return 'bg-[#1b4396]';
  if (p.includes('leetcode')) return 'bg-[#ffa116]';
  if (p.includes('hackerrank')) return 'bg-[#2ec866]';
  if (p.includes('codechef')) return 'bg-[#5b4638]';
  if (p.includes('topcoder')) return 'bg-[#29aae2]';
  if (p.includes('google')) return 'bg-[#4285f4]';
  if (p.includes('meta')) return 'bg-[#0668E1]';
  if (p.includes('atcoder')) return 'bg-[#000000]';
  return 'bg-zinc-800';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
    case 'ongoing':
      return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 pulse-subtle';
    case 'completed':
      return 'text-slate-500 border-slate-500/20 bg-slate-500/5';
    case 'cancelled':
      return 'text-red-500 border-red-500/20 bg-red-500/5';
    default:
      return 'text-muted-foreground border-border bg-muted/50';
  }
};

export default function MainCalendar({
  selectedDate,
  setSelectedDate,
  currentMonth,
  setCurrentMonth,
  viewMode,
  setViewMode,
  events,
  onEventClick,
  searchQuery,
  filters,
  isLoading = false,
}: MainCalendarProps) {
  const monthStart = startOfMonth(currentMonth);

  const days = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(currentMonth));
      const end = endOfWeek(endOfMonth(currentMonth));
      return eachDayOfInterval({ start, end });
    } else if (viewMode === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return eachDayOfInterval({ start, end });
    } else {
      return [selectedDate];
    }
  }, [selectedDate, currentMonth, viewMode]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.extra?.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(event.event_type as any);
      const matchesPlatform =
        filters.platforms.length === 0 || filters.platforms.includes(event.platform);

      let matchesMode = true;
      if (filters.mode === 'online') matchesMode = event.is_online;
      if (filters.mode === 'offline') matchesMode = !event.is_online;
      if (filters.mode === 'hybrid')
        matchesMode = event.is_online && (event.city !== null || event.country !== null);

      const matchesDifficulty =
        !filters.difficulty || event.extra?.difficulty === filters.difficulty;

      return (
        matchesSearch && matchesCategory && matchesPlatform && matchesMode && matchesDifficulty
      );
    });
  }, [events, searchQuery, filters]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(new Date(event.start_time), day));
  };

  const [eventsPopupDay, setEventsPopupDay] = React.useState<Date | null>(null);

  const popupEvents = useMemo(() => {
    if (!eventsPopupDay) return [];
    return getEventsForDay(eventsPopupDay);
  }, [eventsPopupDay, filteredEvents]);

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const listedEvents = useMemo(() => {
    if (viewMode !== 'list') return [];

    const today = startOfDay(new Date());
    const sortedEvents = [...filteredEvents].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    const groups: { date: Date; events: CalendarEvent[] }[] = [];

    // Get all unique dates from today onwards
    const dates = new Set<string>();
    sortedEvents.forEach((e) => {
      const day = startOfDay(new Date(e.start_time));
      if (!isAfter(today, day) || isSameDay(today, day)) {
        dates.add(day.toISOString());
      }
    });

    const sortedDates = Array.from(dates)
      .map((d) => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    sortedDates.forEach((date) => {
      const dayEvents = sortedEvents.filter((e) => isSameDay(new Date(e.start_time), date));
      groups.push({ date, events: dayEvents });
    });

    return groups;
  }, [filteredEvents, viewMode]);

  return (
    <div
      className={cn(
        'bg-card border-border relative flex flex-1 flex-col overflow-hidden rounded-3xl border shadow-sm',
        'h-full',
      )}
    >
      {/* Events List Popup */}
      <AnimatePresence>
        {eventsPopupDay && (
          <div
            className="bg-background/40 absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setEventsPopupDay(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-border flex max-h-[80%] w-full max-w-md flex-col overflow-hidden rounded-3xl border shadow-2xl"
            >
              <div className="border-border bg-muted/30 flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold">{format(eventsPopupDay, 'EEEE, d MMMM')}</h3>
                  <p className="text-muted-foreground text-xs">{popupEvents.length} events</p>
                </div>
                <button
                  onClick={() => setEventsPopupDay(null)}
                  className="hover:bg-muted rounded-full p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="custom-scrollbar flex-1 space-y-3 overflow-auto p-4">
                {popupEvents.map((event, idx) => (
                  <EventBar
                    key={`${event.id}-${idx}`}
                    event={event}
                    isExpanded={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                      setEventsPopupDay(null);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-border bg-background/50 flex items-center gap-4 border-b px-8 py-4">
        {/* Navigation logic correctly placed here */}
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (viewMode === 'month') setCurrentMonth(subMonths(currentMonth, 1));
                else if (viewMode === 'week')
                  setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000));
                else setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000));
              }}
              className="hover:bg-muted text-muted-foreground hover:text-foreground border-border rounded-md border p-1.5 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (viewMode === 'month') setCurrentMonth(addMonths(currentMonth, 1));
                else if (viewMode === 'week')
                  setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
                else setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
              }}
              className="hover:bg-muted text-muted-foreground hover:text-foreground border-border rounded-md border p-1.5 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-lg font-bold tracking-tight">
            {viewMode === 'day'
              ? format(selectedDate, 'MMMM d, yyyy')
              : format(currentMonth, 'MMMM yyyy')}
          </h2>

          <button
            onClick={() => {
              setSelectedDate(new Date());
              setCurrentMonth(new Date());
            }}
            className="hover:bg-muted border-border ml-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Today
          </button>
        </div>

        <div className="bg-muted flex shrink-0 rounded-lg p-1">
          {(['month', 'week', 'day', 'list'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all',
                viewMode === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Week Day Labels (only for month and week) */}
      {viewMode !== 'day' && viewMode !== 'list' && (
        <div className="border-border grid grid-cols-7 border-b">
          {viewMode === 'month'
            ? weekDays.map((day) => (
                <div
                  key={day}
                  className="text-muted-foreground/40 border-border border-r px-4 py-2 text-center text-[10px] font-bold tracking-widest uppercase last:border-r-0"
                >
                  {day.slice(0, 3)}
                </div>
              ))
            : days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="text-muted-foreground/40 border-border border-r px-4 py-2 text-center text-[10px] font-bold tracking-widest uppercase last:border-r-0"
                >
                  {format(day, 'EEE d')}
                </div>
              ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-background custom-scrollbar flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-3xl space-y-12">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="bg-muted h-6 w-32 animate-pulse rounded" />
                    <div className="space-y-3">
                      <EventSkeleton isExpanded={true} />
                      <EventSkeleton isExpanded={true} />
                    </div>
                  </div>
                ))}
              </div>
            ) : listedEvents.length > 0 ? (
              listedEvents.map((group) => (
                <div key={group.date.toISOString()} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3
                      className={cn(
                        'text-xl font-bold tracking-tight',
                        isToday(group.date) ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {isToday(group.date) ? 'Today' : format(group.date, 'dd/MM/yyyy')}
                    </h3>
                    <div className="bg-border h-px flex-1 opacity-50" />
                  </div>
                  <div className="space-y-4">
                    {group.events.map((event, idx) => (
                      <EventBar
                        key={`${event.id}-${idx}`}
                        event={event}
                        isExpanded={true}
                        viewMode="list"
                        onClick={() => onEventClick(event)}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-24 opacity-30">
                <CalendarIcon className="mb-4 h-16 w-16" />
                <p className="text-2xl font-medium">No upcoming events found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      {viewMode !== 'list' && (
        <div className={cn('bg-border no-scrollbar flex-1 overflow-y-auto')}>
          <div
            className={cn(
              'grid gap-px',
              viewMode === 'month' || viewMode === 'week'
                ? 'h-full min-h-[600px] grid-cols-7'
                : 'h-auto grid-cols-1',
            )}
          >
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'group relative m-0.5 flex cursor-pointer flex-col rounded-xl border p-2 transition-all',
                    viewMode === 'day' ? 'min-h-full p-8' : 'min-h-[120px]',
                    // Base background and text colors - All cells white background, black bold text
                    'bg-white text-black',

                    // Today highlight (Golden Border)
                    isTodayDate && 'z-10 border-amber-500',

                    // Selected border (Black Border)
                    isSelected && 'z-20 border-black shadow-sm',

                    // Non-current month styling (less opacity)
                    !isCurrentMonth && 'opacity-30',

                    viewMode !== 'day' && 'hover:bg-slate-50',
                  )}
                >
                  <div
                    className={cn(
                      'mb-1 flex items-center justify-between px-1',
                      viewMode === 'day' && 'hidden',
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day);
                        setViewMode('day');
                      }}
                      className={cn(
                        'flex items-center justify-center rounded-md transition-all',
                        viewMode === 'day'
                          ? 'bg-muted border-border border p-2 text-sm font-bold'
                          : 'h-6 w-6 text-xs',
                        'font-black text-black',
                        isTodayDate && 'text-amber-600',
                      )}
                    >
                      {viewMode === 'day' ? format(day, 'EEE, d MMM') : format(day, 'd')}
                    </button>
                  </div>

                  <div
                    className={cn(
                      'space-y-1 overflow-hidden',
                      viewMode === 'day' && 'mx-auto max-w-3xl space-y-4 overflow-visible',
                    )}
                  >
                    <AnimatePresence>
                      {isLoading
                        ? viewMode === 'day'
                          ? [1, 2, 3].map((i) => (
                              <EventSkeleton key={`skeleton-${i}`} isExpanded={true} />
                            ))
                          : [1, 2].map((i) => (
                              <EventSkeleton key={`skeleton-${i}`} isExpanded={false} />
                            ))
                        : (viewMode === 'month' ? dayEvents.slice(0, 2) : dayEvents).map(
                            (event, idx) => (
                              <EventBar
                                key={`${event.id}-${day.toISOString()}-${idx}`}
                                event={event}
                                isExpanded={viewMode === 'day'}
                                viewMode={viewMode}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(event);
                                }}
                              />
                            ),
                          )}
                    </AnimatePresence>
                    {viewMode === 'month' && dayEvents.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventsPopupDay(day);
                        }}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted w-full rounded px-2 py-0.5 text-left text-[10px] font-bold transition-colors"
                      >
                        + {dayEvents.length - 2} more
                      </button>
                    )}
                    {dayEvents.length === 0 && viewMode === 'day' && (
                      <div className="text-muted-foreground flex flex-col items-center justify-center py-12 opacity-30">
                        <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                          <CalendarIcon className="h-8 w-8" />
                        </div>
                        <p className="text-xl font-medium">No events scheduled</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface EventBarProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  isExpanded?: boolean;
  viewMode?: ViewMode;
}

const EventSkeleton: React.FC<{ isExpanded?: boolean }> = ({ isExpanded }) => {
  return (
    <div
      className={cn(
        'bg-muted border-border/50 animate-pulse rounded-2xl border',
        isExpanded ? 'h-[140px] p-5' : 'h-[30px] rounded-md',
      )}
    >
      <div className="flex h-full gap-3">
        <div className="bg-muted-foreground/10 h-full w-1.5 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="bg-muted-foreground/10 h-4 w-3/4 rounded" />
          {isExpanded && <div className="bg-muted-foreground/10 h-3 w-1/2 rounded" />}
        </div>
      </div>
    </div>
  );
};

const EventBar: React.FC<EventBarProps> = ({ event, onClick, isExpanded = false, viewMode }) => {
  const category = CATEGORIES.find((c) => c.id === event.event_type);

  const faviconUrl = useMemo(() => {
    if (!event.url) return null;
    try {
      const url = new URL(event.url);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    } catch {
      return null;
    }
  }, [event.url]);

  const CategoryIcon = ({ id, className }: { id?: string; className?: string }) => {
    switch (id) {
      case 'hackathon':
        return <Trophy className={className} />;
      case 'competitive_programming':
        return <Terminal className={className} />;
      case 'global_competition':
        return <Trophy className={className} />;
      case 'live_stream':
        return <Video className={className} />;
      case 'community_event':
        return <Users className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  const getCategoryStyles = (type?: string, expanded?: boolean) => {
    switch (type) {
      case 'competitive_programming':
        return expanded
          ? 'border-zinc-500/20 bg-zinc-500/5 text-zinc-700 dark:text-zinc-300 shadow-zinc-500/5'
          : 'border-zinc-500/15 bg-zinc-50/60 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-300';
      case 'hackathon':
        return expanded
          ? 'border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-400 shadow-purple-500/5'
          : 'border-purple-500/15 bg-purple-50/60 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'data_science':
        return expanded
          ? 'border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-400 shadow-blue-500/5'
          : 'border-blue-500/15 bg-blue-50/60 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'global_competition':
        return expanded
          ? 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 shadow-amber-500/5'
          : 'border-amber-500/15 bg-amber-50/60 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'hiring_challenge':
        return expanded
          ? 'border-orange-500/20 bg-orange-500/5 text-orange-700 dark:text-orange-400 shadow-orange-500/5'
          : 'border-orange-500/15 bg-orange-50/60 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400';
      case 'community_event':
        return expanded
          ? 'border-pink-500/20 bg-pink-500/5 text-pink-700 dark:text-pink-400 shadow-pink-500/5'
          : 'border-pink-500/15 bg-pink-50/60 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400';
      case 'conference':
        return expanded
          ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 shadow-indigo-500/5'
          : 'border-indigo-500/15 bg-indigo-50/60 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400';
      case 'cybersecurity_ctf':
        return expanded
          ? 'border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400 shadow-red-500/5'
          : 'border-red-500/15 bg-red-50/60 dark:bg-red-500/10 text-red-700 dark:text-red-400';
      case 'open_source':
        return expanded
          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 shadow-emerald-500/5'
          : 'border-emerald-500/15 bg-emerald-50/60 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'live_stream':
        return expanded
          ? 'border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400 shadow-rose-500/5'
          : 'border-rose-500/15 bg-rose-50/60 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400';
      default:
        return expanded
          ? 'border-slate-500/20 bg-slate-500/5 text-slate-700 dark:text-slate-400 shadow-slate-500/5'
          : 'border-slate-500/15 bg-slate-50/60 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400';
    }
  };

  if (isExpanded) {
    const isListView = viewMode === 'list';

    return (
      <motion.div
        layoutId={`event-${event.id}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01, x: 2 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-[2rem] border p-6 shadow-xl transition-all active:scale-[0.99]',
          getCategoryStyles(event.event_type, true),
        )}
      >
        {/* Category Art bg */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.2] transition-opacity duration-500 group-hover:opacity-[0.3] dark:opacity-[0.3] dark:group-hover:opacity-[0.4]">
          <CategoryIcon
            id={event.event_type}
            className="h-[120%] w-[120%] translate-x-4 translate-y-8 -rotate-12"
          />
        </div>

        <div className="relative z-10 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                className="border-border h-8 w-8 rounded-lg border bg-white p-1 shadow-sm"
                alt="Logo"
              />
            ) : (
              <div className="bg-muted border-border flex h-8 w-8 items-center justify-center rounded-lg border">
                <CategoryIcon id={event.event_type} className="h-4 w-4 opacity-50" />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {category && (
                <div
                  className={cn(
                    'shrink-0 rounded-md border px-2 py-0.5 text-[9px] font-black tracking-tighter uppercase shadow-xs',
                    category.color.replace('bg-', 'bg-').replace('-500', '-500/10'),
                    category.color.replace('bg-', 'border-').replace('-500', '-500/20'),
                    category.color
                      .replace('bg-', 'text-')
                      .replace('-500', '-600 dark:text-')
                      .concat('-400'),
                  )}
                >
                  {category.label}
                </div>
              )}
              {event.extra?.difficulty && (
                <div className="shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black tracking-tighter text-amber-600 uppercase shadow-xs dark:text-amber-400">
                  {event.extra.difficulty}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {event.is_free ? (
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-black tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                FREE
              </div>
            ) : (
              event.price && (
                <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[9px] font-black tracking-widest text-amber-600 uppercase dark:text-amber-400">
                  {event.price}
                </div>
              )
            )}
            <div
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-black tracking-widest uppercase',
                getStatusColor(event.status),
              )}
            >
              <div
                className={cn(
                  'h-1.5 w-1.5 rounded-full bg-current',
                  event.status === 'ongoing' && 'animate-ping',
                )}
              />
              {event.status}
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div>
            <h3 className="group-hover:text-foreground line-clamp-2 text-xl leading-tight font-black tracking-tighter italic transition-colors">
              {event.title}
            </h3>
            {event.tags && event.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {event.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-muted-foreground/60 group-hover:text-primary/70 text-[9px] font-bold tracking-widest uppercase transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
                {event.tags.length > 3 && (
                  <span className="text-muted-foreground/30 text-[9px] font-bold tracking-widest uppercase">
                    +{event.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-black tracking-[0.2em] uppercase">
            {isListView ? (
              <div className="space-y-3 opacity-80 transition-opacity group-hover:opacity-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black tracking-[0.3em] opacity-30">
                    TIME ZONE
                  </span>
                  <span className="text-foreground tracking-widest">{event.timezone || 'UTC'}</span>
                </div>
                <div className="flex gap-12">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black tracking-[0.3em] opacity-30">START</span>
                    <span className="text-foreground">
                      {format(new Date(event.start_time), 'EEE, d MMM yyyy • HH:mm')}
                    </span>
                  </div>
                  {event.end_time && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black tracking-[0.3em] opacity-30">END</span>
                      <span className="text-foreground">
                        {format(new Date(event.end_time), 'EEE, d MMM yyyy • HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 opacity-60">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> {format(new Date(event.start_time), 'HH:mm')}
                </span>
                {event.is_online && (
                  <span className="text-emerald-600 dark:text-emerald-400">Online</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end">
            <div
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all group-hover:scale-105 group-hover:shadow-xl',
                getPlatformColor(event.platform),
              )}
            >
              {event.platform}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 5 }}
      whileHover={{ scale: 1.02 }}
      layoutId={`event-${event.id}`}
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer truncate overflow-hidden rounded-lg border px-2 py-1.5 text-[10px] font-bold shadow-sm transition-all hover:brightness-105 active:scale-98',
        getCategoryStyles(event.event_type),
      )}
    >
      {/* Category Art bg small */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-end opacity-[0.25] transition-opacity duration-500 group-hover:opacity-[0.4] dark:opacity-[0.35] dark:group-hover:opacity-[0.5]">
        <CategoryIcon id={event.event_type} className="h-12 w-12 translate-x-2 rotate-12" />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        {faviconUrl ? (
          <img src={faviconUrl} className="h-3 w-3 rounded-sm bg-white" alt="Logo" />
        ) : (
          <div className={cn('h-1.5 w-1.5 rounded-full', category?.color)} />
        )}
        <span className="flex-1 truncate tracking-tight">{event.title}</span>
      </div>
    </motion.div>
  );
};
