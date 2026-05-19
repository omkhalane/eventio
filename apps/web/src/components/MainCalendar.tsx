import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
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
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Shield,
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

export const CategoryBackgroundArt = ({
  category,
  className = 'absolute inset-0 pointer-events-none overflow-hidden opacity-[0.20] transition-opacity duration-500 group-hover:opacity-[0.30]',
}: {
  category?: string;
  className?: string;
}) => {
  switch (category) {
    case 'hackathon':
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-purple-500"
            strokeWidth="0.5"
          >
            <path d="M40 30 h20 v30 c0 10 -5 15 -10 15 s-10 -5 -10 -15 Z" />
            <path d="M50 75 v10 M40 85 h20" />
            <path d="M40 40 h-5 c-5 0 -5 10 0 10 h5 M60 40 h5 c5 0 5 10 0 10 h5" />
            <line x1="10" y1="10" x2="90" y2="10" strokeDasharray="2 2" />
            <line x1="10" y1="20" x2="90" y2="20" strokeDasharray="2 2" />
            <line x1="10" y1="80" x2="90" y2="80" strokeDasharray="2 2" />
            <circle cx="20" cy="30" r="1.5" className="fill-current" />
            <circle cx="80" cy="40" r="1" className="fill-current" />
            <circle cx="25" cy="70" r="2" className="fill-current" />
            <circle cx="75" cy="65" r="1.5" className="fill-current" />
          </svg>
        </div>
      );
    case 'competitive_programming':
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-amber-500"
            strokeWidth="0.5"
          >
            <path d="M20 30 L40 45 L20 60" strokeWidth="1.5" />
            <line x1="45" y1="60" x2="65" y2="60" strokeWidth="1.5" />
            <text
              x="70"
              y="20"
              fontSize="8"
              fontFamily="monospace"
              className="fill-current stroke-none"
            >
              01
            </text>
            <text
              x="80"
              y="35"
              fontSize="8"
              fontFamily="monospace"
              className="fill-current stroke-none"
            >
              10
            </text>
            <text
              x="15"
              y="85"
              fontSize="8"
              fontFamily="monospace"
              className="fill-current stroke-none"
            >
              11
            </text>
            <line x1="5" y1="15" x2="35" y2="15" strokeDasharray="8 4" />
            <line x1="60" y1="80" x2="95" y2="80" strokeDasharray="12 6" />
          </svg>
        </div>
      );
    case 'data_science':
    case 'ai_ml':
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-cyan-500"
            strokeWidth="0.5"
          >
            <circle cx="30" cy="40" r="2.5" className="fill-current" />
            <circle cx="50" cy="25" r="2.5" className="fill-current" />
            <circle cx="50" cy="55" r="2.5" className="fill-current" />
            <circle cx="70" cy="40" r="2.5" className="fill-current" />
            <line x1="30" y1="40" x2="50" y2="25" />
            <line x1="30" y1="40" x2="50" y2="55" />
            <line x1="50" y1="25" x2="70" y2="40" />
            <line x1="50" y1="55" x2="70" y2="40" />
            <line x1="50" y1="25" x2="50" y2="55" />
            <path d="M10 75 Q 30 60, 50 75 T 90 75" />
            <path d="M10 82 Q 30 67, 50 82 T 90 82" opacity="0.5" />
          </svg>
        </div>
      );
    case 'cybersecurity_ctf':
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-red-500"
            strokeWidth="0.5"
          >
            <path d="M50 20 C 65 20, 75 25, 75 25 V 50 C 75 65, 65 75, 50 80 C 35 75, 25 65, 25 50 V 25 C 25 25, 35 20, 50 20 Z" />
            <line x1="15" y1="15" x2="85" y2="15" strokeDasharray="3 3" />
            <line x1="15" y1="35" x2="85" y2="35" strokeDasharray="3 3" />
            <line x1="15" y1="65" x2="85" y2="65" strokeDasharray="3 3" />
            <line x1="15" y1="85" x2="85" y2="85" strokeDasharray="3 3" />
            <line x1="30" y1="10" x2="30" y2="90" strokeDasharray="3 3" />
            <line x1="70" y1="10" x2="70" y2="90" strokeDasharray="3 3" />
          </svg>
        </div>
      );
    case 'open_source':
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-emerald-500"
            strokeWidth="0.5"
          >
            <path d="M25 80 V 30" />
            <circle cx="25" cy="80" r="2" className="fill-current" />
            <circle cx="25" cy="30" r="2" className="fill-current" />
            <path d="M25 55 C 45 55, 45 40, 65 40 H 80" />
            <circle cx="70" cy="40" r="2" className="fill-current" />
            <circle cx="50" cy="70" r="1.5" className="fill-current" />
            <line x1="25" y1="80" x2="50" y2="70" strokeDasharray="1 1" />
          </svg>
        </div>
      );
    case 'web_development':
    case 'community_event':
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-blue-500"
            strokeWidth="0.5"
          >
            <rect x="20" y="25" width="60" height="50" rx="3" />
            <line x1="20" y1="37" x2="80" y2="37" />
            <circle cx="26" cy="31" r="1" className="fill-current" />
            <circle cx="31" cy="31" r="1" className="fill-current" />
            <circle cx="36" cy="31" r="1" className="fill-current" />
            <rect x="28" y="45" width="20" height="10" rx="1" />
            <rect x="52" y="45" width="20" height="22" rx="1" />
            <rect x="28" y="59" width="20" height="8" rx="1" />
          </svg>
        </div>
      );
    case 'startup':
    case 'global_competition':
    case 'hiring_challenge':
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-yellow-500"
            strokeWidth="0.5"
          >
            <path d="M15 85 Q 40 80, 55 55 T 85 15" strokeWidth="1" />
            <path d="M85 15 L 70 18 M 85 15 L 82 30" strokeWidth="1" />
            <rect x="25" y="70" width="6" height="15" rx="1" />
            <rect x="38" y="58" width="6" height="27" rx="1" />
            <rect x="51" y="45" width="6" height="40" rx="1" />
            <circle cx="85" cy="15" r="3" className="fill-current" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={className}>
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full fill-none stroke-current text-slate-400"
            strokeWidth="0.5"
          >
            <circle cx="50" cy="50" r="2.5" className="fill-current" />
            <circle cx="20" cy="20" r="1.5" className="fill-current" />
            <circle cx="80" cy="20" r="1.5" className="fill-current" />
            <circle cx="80" cy="80" r="1.5" className="fill-current" />
            <circle cx="20" cy="80" r="1.5" className="fill-current" />
            <line x1="20" y1="20" x2="50" y2="50" strokeDasharray="2 2" />
            <line x1="80" y1="20" x2="50" y2="50" strokeDasharray="2 2" />
            <line x1="80" y1="80" x2="50" y2="50" strokeDasharray="2 2" />
            <line x1="20" y1="80" x2="50" y2="50" strokeDasharray="2 2" />
          </svg>
        </div>
      );
  }
};

export const getCategoryTheme = (type?: string) => {
  switch (type) {
    case 'competitive_programming':
      return {
        baseBorder: 'border-2 border-amber-500/50',
        hoverBorder: 'hover:border-amber-500/70',
        bg: 'bg-amber-50',
        text: 'text-amber-950 transition-all duration-300',
        titleText: 'text-amber-950 transition-all duration-300',
        descText: 'text-amber-900 transition-all duration-300',
        mutedText: 'text-amber-700 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(245,158,11,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(245,158,11,0.22)]',
        platformBg: 'bg-amber-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-amber-100 border-amber-500/30 text-amber-950',
      };
    case 'hackathon':
      return {
        baseBorder: 'border-2 border-purple-500/50',
        hoverBorder: 'hover:border-purple-500/70',
        bg: 'bg-purple-50',
        text: 'text-purple-950 transition-all duration-300',
        titleText: 'text-purple-950 transition-all duration-300',
        descText: 'text-purple-900 transition-all duration-300',
        mutedText: 'text-purple-700 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(168,85,247,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(168,85,247,0.22)]',
        platformBg: 'bg-purple-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-purple-100 border-purple-500/30 text-purple-950',
      };
    case 'data_science':
    case 'ai_ml':
      return {
        baseBorder: 'border-2 border-cyan-500/50',
        hoverBorder: 'hover:border-cyan-500/70',
        bg: 'bg-cyan-50',
        text: 'text-cyan-950 transition-all duration-300',
        titleText: 'text-cyan-950 transition-all duration-300',
        descText: 'text-cyan-900 transition-all duration-300',
        mutedText: 'text-cyan-700 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(6,182,212,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(6,182,212,0.22)]',
        platformBg: 'bg-cyan-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-cyan-100 border-cyan-500/30 text-cyan-950',
      };
    case 'cybersecurity_ctf':
      return {
        baseBorder: 'border-2 border-red-500/50',
        hoverBorder: 'hover:border-red-500/70',
        bg: 'bg-red-50',
        text: 'text-red-950 transition-all duration-300',
        titleText: 'text-red-950 transition-all duration-300',
        descText: 'text-red-900 transition-all duration-300',
        mutedText: 'text-red-700 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(239,68,68,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(239,68,68,0.22)]',
        platformBg: 'bg-red-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-red-100 border-red-500/30 text-red-950',
      };
    case 'open_source':
      return {
        baseBorder: 'border-2 border-emerald-500/50',
        hoverBorder: 'hover:border-emerald-500/70',
        bg: 'bg-emerald-50',
        text: 'text-emerald-950 transition-all duration-300',
        titleText: 'text-emerald-950 transition-all duration-300',
        descText: 'text-emerald-900 transition-all duration-300',
        mutedText: 'text-emerald-700 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(16,185,129,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(16,185,129,0.22)]',
        platformBg: 'bg-emerald-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-emerald-100 border-emerald-500/30 text-emerald-950',
      };
    case 'community_event':
    case 'web_development':
      return {
        baseBorder: 'border-2 border-blue-500/50',
        hoverBorder: 'hover:border-blue-500/70',
        bg: 'bg-blue-50',
        text: 'text-blue-950 transition-all duration-300',
        titleText: 'text-blue-950 transition-all duration-300',
        descText: 'text-blue-900 transition-all duration-300',
        mutedText: 'text-blue-700 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(59,130,246,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(59,130,246,0.22)]',
        platformBg: 'bg-blue-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-blue-100 border-blue-500/30 text-blue-950',
      };
    case 'global_competition':
    case 'startup':
      return {
        baseBorder: 'border-2 border-yellow-600/50',
        hoverBorder: 'hover:border-yellow-600/70',
        bg: 'bg-yellow-50',
        text: 'text-yellow-950 transition-all duration-300',
        titleText: 'text-yellow-950 transition-all duration-300',
        descText: 'text-yellow-900',
        mutedText: 'text-yellow-800 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(234,179,8,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(234,179,8,0.22)]',
        platformBg: 'bg-yellow-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-yellow-100 border-yellow-600/30 text-yellow-950',
      };
    default:
      return {
        baseBorder: 'border-2 border-slate-500/50',
        hoverBorder: 'hover:border-slate-500/70',
        bg: 'bg-slate-50',
        text: 'text-slate-950 transition-all duration-300',
        titleText: 'text-slate-950 transition-all duration-300',
        descText: 'text-slate-900 transition-all duration-300',
        mutedText: 'text-slate-700 transition-all duration-300',
        shadow: 'shadow-[0_10px_35px_rgba(100,116,139,0.08)]',
        hoverShadow: 'hover:shadow-[0_15px_50px_rgba(100,116,139,0.22)]',
        platformBg: 'bg-slate-600 text-white font-extrabold tracking-widest',
        badgeBg: 'bg-slate-100 border-slate-500/30 text-slate-950',
      };
  }
};

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

  const gridRef = React.useRef<HTMLDivElement>(null);
  const dayButtonRefs = React.useRef(new Map<string, HTMLButtonElement | null>());
  const [gridHeight, setGridHeight] = React.useState(600);
  const selectedDayKey = format(selectedDate, 'yyyy-MM-dd');

  const registerDayButton = React.useCallback(
    (day: Date) => (node: HTMLButtonElement | null) => {
      const key = format(day, 'yyyy-MM-dd');
      if (node) {
        dayButtonRefs.current.set(key, node);
      } else {
        dayButtonRefs.current.delete(key);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (viewMode === 'list') return;

    const frame = window.requestAnimationFrame(() => {
      dayButtonRefs.current.get(selectedDayKey)?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [currentMonth, selectedDayKey, viewMode]);

  const navigateByShortcut = React.useCallback(
    (direction: 'previous' | 'next', span: 'primary' | 'year') => {
      const targetDate =
        span === 'year'
          ? direction === 'next'
            ? addYears(selectedDate, 1)
            : subYears(selectedDate, 1)
          : viewMode === 'month'
            ? direction === 'next'
              ? addMonths(selectedDate, 1)
              : subMonths(selectedDate, 1)
            : viewMode === 'week'
              ? direction === 'next'
                ? addWeeks(selectedDate, 1)
                : subWeeks(selectedDate, 1)
              : direction === 'next'
                ? addDays(selectedDate, 1)
                : subDays(selectedDate, 1);

      setSelectedDate(targetDate);
      setCurrentMonth(targetDate);
    },
    [selectedDate, setCurrentMonth, setSelectedDate, viewMode],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"], [aria-modal="true"], [data-calendar-modal="true"]',
        )
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (viewMode !== 'list') {
        if (key === 'arrowleft' || key === 'a') {
          e.preventDefault();
          navigateByShortcut('previous', 'primary');
          return;
        }

        if (key === 'arrowright' || key === 'd') {
          e.preventDefault();
          navigateByShortcut('next', 'primary');
          return;
        }

        if (key === 'arrowup' || key === 'f') {
          e.preventDefault();
          navigateByShortcut('previous', 'year');
          return;
        }

        if (key === 'arrowdown' || key === 's') {
          e.preventDefault();
          navigateByShortcut('next', 'year');
          return;
        }
      }

      if (key === 'l') {
        e.preventDefault();
        setViewMode('list');
      } else if (key === 'm') {
        e.preventDefault();
        setViewMode('month');
      } else if (key === 'k') {
        e.preventDefault();
        setViewMode('week');
      } else if (key === 'y') {
        e.preventDefault();
        setViewMode('day');
      }
    },
    [navigateByShortcut, setViewMode, viewMode],
  );

  React.useEffect(() => {
    if (viewMode !== 'month') return;
    const element = gridRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.height) {
          setGridHeight(entry.contentRect.height);
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [viewMode]);

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

  const cellCapacity = React.useMemo(() => {
    if (viewMode !== 'month') return { maxWithoutMore: 100, maxWithMore: 100 };
    const numRows = Math.ceil(days.length / 7);
    const cellHeight = gridHeight / numRows;

    // Header/padding takes ~46px, each EventBar is 38px, and '+more' button is 22px
    const headerAndPadding = 46;
    const eventRowHeight = 38;
    const moreButtonHeight = 22;

    const maxWithoutMore = Math.floor((cellHeight - headerAndPadding) / eventRowHeight);
    const maxWithMore = Math.floor(
      (cellHeight - headerAndPadding - moreButtonHeight) / eventRowHeight,
    );

    return {
      maxWithoutMore: Math.max(1, maxWithoutMore),
      maxWithMore: Math.max(1, maxWithMore),
    };
  }, [gridHeight, days.length, viewMode]);

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

  const getEventsForDay = React.useCallback(
    (day: Date) => {
      return filteredEvents.filter((event) => isSameDay(new Date(event.start_time), day));
    },
    [filteredEvents],
  );

  const [eventsPopupDay, setEventsPopupDay] = React.useState<Date | null>(null);

  const popupEvents = useMemo(() => {
    if (!eventsPopupDay) return [];
    return getEventsForDay(eventsPopupDay);
  }, [eventsPopupDay, getEventsForDay]);

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
      data-main-calendar="true"
      onKeyDown={handleKeyDown}
      className={cn(
        'bg-card border-border relative flex flex-1 flex-col overflow-hidden rounded-3xl border shadow-sm',
        'h-full',
      )}
    >
      {/* Events List Popup */}
      <AnimatePresence>
        {eventsPopupDay && (
          <div
            data-calendar-modal="true"
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
            ref={gridRef}
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

              const fitsAll = dayEvents.length <= cellCapacity.maxWithoutMore;
              const sliceLimit = fitsAll ? dayEvents.length : cellCapacity.maxWithMore;
              const eventsToShow =
                viewMode === 'month' ? dayEvents.slice(0, sliceLimit) : dayEvents;
              const showMore = viewMode === 'month' && !fitsAll;
              const moreCount = dayEvents.length - sliceLimit;

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
                      ref={registerDayButton(day)}
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
                        : eventsToShow.map((event, idx) => (
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
                          ))}
                    </AnimatePresence>
                    {showMore && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventsPopupDay(day);
                        }}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted w-full rounded px-2 py-0.5 text-left text-[10px] font-bold transition-colors"
                      >
                        + {moreCount} more
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
  const theme = getCategoryTheme(event.event_type);

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
      case 'cybersecurity_ctf':
        return <Shield className={className} />;
      case 'data_science':
      case 'ai_ml':
        return <Cpu className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  const getCategoryStyles = (type?: string, expanded?: boolean) => {};

  if (isExpanded) {
    const isListView = viewMode === 'list';

    return (
      <motion.div
        layoutId={`event-${event.id}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.015, y: -4 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-[2rem] border-2 p-8 shadow-2xl transition-all active:scale-[0.99]',
          theme.baseBorder,
          theme.hoverBorder,
          theme.bg,
          theme.text,
          theme.shadow,
          theme.hoverShadow,
        )}
      >
        {/* Category Art bg */}
        <CategoryBackgroundArt category={event.event_type} />

        <div className="relative z-10 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {faviconUrl ? (
              <img
                src={faviconUrl}
                className="border-border h-9 w-9 rounded-xl border bg-white p-1 shadow-sm"
                alt="Logo"
              />
            ) : (
              <div className="bg-muted border-border flex h-9 w-9 items-center justify-center rounded-xl border">
                <CategoryIcon id={event.event_type} className="h-5 w-5 opacity-70" />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {category && (
                <div
                  className={cn(
                    'shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase shadow-xs transition-colors',
                    theme.badgeBg,
                  )}
                >
                  {category.label}
                </div>
              )}
              {event.extra?.difficulty && (
                <div className="shrink-0 rounded-md border border-amber-500/40 bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-900 uppercase shadow-xs">
                  {event.extra.difficulty}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {event.is_free ? (
              <div className="rounded-full border border-emerald-600/40 bg-emerald-100 px-3 py-1 text-[10px] font-black tracking-widest text-emerald-800 uppercase">
                FREE
              </div>
            ) : (
              event.price && (
                <div className="rounded-full border border-amber-600/40 bg-amber-100 px-3 py-1 text-[10px] font-black tracking-widest text-amber-800 uppercase">
                  {event.price}
                </div>
              )
            )}
            <div
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase',
                getStatusColor(event.status),
              )}
            >
              <div
                className={cn(
                  'h-2 w-2 rounded-full bg-current',
                  event.status === 'ongoing' && 'animate-ping',
                )}
              />
              {event.status}
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          <div>
            <h3
              className={cn(
                'line-clamp-2 text-2xl leading-snug font-black tracking-tight transition-colors',
                theme.titleText,
              )}
            >
              {event.title}
            </h3>
            {event.tags && event.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {event.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'text-[11px] font-extrabold tracking-wider uppercase transition-colors',
                      theme.mutedText,
                    )}
                  >
                    #{tag}
                  </span>
                ))}
                {event.tags.length > 3 && (
                  <span
                    className={cn(
                      'text-[10px] font-extrabold tracking-widest uppercase',
                      theme.mutedText,
                    )}
                  >
                    +{event.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-black tracking-[0.2em] uppercase">
            {isListView ? (
              <div className={cn('space-y-3 transition-opacity', theme.descText)}>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black tracking-[0.3em] opacity-40">
                    TIME ZONE
                  </span>
                  <span className="font-bold tracking-widest">{event.timezone || 'UTC'}</span>
                </div>
                <div className="flex gap-12">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black tracking-[0.3em] opacity-40">START</span>
                    <span className="font-bold">
                      {format(new Date(event.start_time), 'EEE, d MMM yyyy • HH:mm')}
                    </span>
                  </div>
                  {event.end_time && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black tracking-[0.3em] opacity-40">END</span>
                      <span className="font-bold">
                        {format(new Date(event.end_time), 'EEE, d MMM yyyy • HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={cn('flex items-center gap-4 font-bold', theme.mutedText)}>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {format(new Date(event.start_time), 'HH:mm')}
                </span>
                {event.is_online && <span className="font-extrabold text-emerald-700">Online</span>}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end">
            <div
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-5 py-2 text-xs font-black tracking-widest uppercase shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg',
                theme.platformBg,
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
      whileHover={{ scale: 1.03 }}
      layoutId={`event-${event.id}`}
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer truncate overflow-hidden rounded-xl border-2 px-3 py-2.5 text-[11px] font-bold shadow-sm transition-all active:scale-98',
        theme.baseBorder,
        theme.bg,
        theme.text,
        theme.shadow,
        theme.hoverBorder,
        theme.hoverShadow,
      )}
    >
      {/* Category Art bg small */}
      <CategoryBackgroundArt
        category={event.event_type}
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.22] transition-opacity duration-500 group-hover:opacity-[0.32]"
      />

      <div className="relative z-10 flex items-center gap-2">
        {faviconUrl ? (
          <img
            src={faviconUrl}
            className="h-3.5 w-3.5 rounded-sm border border-stone-200/20 bg-white p-[1px] shadow-sm"
            alt="Logo"
          />
        ) : (
          <div className={cn('h-2 w-2 rounded-full bg-current opacity-90')} />
        )}
        <span className={cn('flex-1 truncate font-bold tracking-tight', theme.titleText)}>
          {event.title}
        </span>
      </div>
    </motion.div>
  );
};
