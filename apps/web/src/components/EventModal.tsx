import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  Clock,
  Infinity as InfinityIcon,
  Star,
  Terminal,
  Trophy,
  Users,
  Video,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useMemo, useState } from 'react';

import { CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { syncEventToGoogle } from '../services/googleCalendarService';
import { CalendarEvent } from '../types';

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  isAuthorized?: boolean;
  onSignIn?: () => Promise<void>;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function EventModal({ event, onClose, isAuthorized, onSignIn }: EventModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faviconUrl = useMemo(() => {
    if (!event?.url) return null;
    try {
      const url = new URL(event.url);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
    } catch {
      return null;
    }
  }, [event]);

  const CategoryIcon = useMemo(() => {
    if (!event) return Star;
    switch (event.event_type) {
      case 'hackathon':
        return Trophy;
      case 'competitive_programming':
        return Terminal;
      case 'global_competition':
        return Trophy;
      case 'live_stream':
        return Video;
      case 'community_event':
        return Users;
      default:
        return Star;
    }
  }, [event]);

  if (!event) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      if (!isAuthorized && onSignIn) {
        await onSignIn();
      }
      // Map to old format for sync service if needed or update service
      await syncEventToGoogle(event);
      setIsSynced(true);
      setTimeout(() => setIsSynced(false), 3000);
    } catch (err: any) {
      console.error('Failed to sync event:', err);
      let errorMsg = err.message || 'Failed to sync to Google Calendar.';
      if (errorMsg.includes('disabled') || errorMsg.includes('not been used')) {
        errorMsg =
          'Google Calendar API is not enabled. Please enable it in Google Cloud Console to use sync.';
      }
      setError(errorMsg);
    } finally {
      setIsSyncing(false);
    }
  };

  const isServiceDisabled = error?.includes('enable it') || error?.includes('disabled');

  const category = CATEGORIES.find((c) => c.id === event.event_type);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="bg-background/40 absolute inset-0 backdrop-blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            'bg-background/60 relative flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-[2.5rem] border border-white/20 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl',
          )}
        >
          <div
            className={cn(
              'relative z-10 flex flex-col overflow-hidden rounded-[calc(2.5rem-2px)]',
              category?.color.replace('bg-', 'bg-').replace('-500', '-500/10') ||
                'bg-background/20',
            )}
          >
            {/* Background Art */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03] transition-colors">
              <CategoryIcon
                className={cn(
                  'h-[120%] w-[120%] translate-x-10 translate-y-20 -rotate-12',
                  category?.color.replace('bg-', 'text-').replace('-500', '-500/10') ||
                    'text-foreground',
                )}
              />
            </div>

            <div
              className={cn(
                'custom-scrollbar relative flex flex-col overflow-y-auto rounded-[calc(2.5rem-2px)] border-t border-l border-white/20 p-5 sm:p-8',
                category?.color.replace('bg-', 'bg-').replace('-500', '-500/5') || 'bg-transparent',
              )}
            >
              <button
                onClick={onClose}
                className="hover:bg-muted text-foreground hover:text-foreground absolute top-5 right-5 z-20 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative z-10 space-y-4">
                {/* Logo & Platform & Category Badges */}
                <div className="flex items-start gap-4">
                  {faviconUrl ? (
                    <div className="border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white p-2 shadow-lg">
                      <img src={faviconUrl} alt="Logo" className="h-6 w-6 object-contain" />
                    </div>
                  ) : (
                    <div className="bg-muted border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border p-2 shadow-lg">
                      <CategoryIcon className="text-foreground h-5 w-5" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        'rounded-lg px-3 py-1 text-[9px] font-black tracking-widest text-white uppercase shadow-sm',
                        category?.color || 'bg-zinc-800',
                      )}
                    >
                      {category?.label || event.event_type}
                    </span>
                    <span className="rounded-lg bg-zinc-900 px-3 py-1 text-[9px] font-black tracking-widest text-zinc-100 uppercase shadow-sm dark:bg-white dark:text-black">
                      {event.platform}
                    </span>
                    <span className="rounded-lg border border-black/5 bg-zinc-100 px-3 py-1 text-[9px] font-black tracking-widest text-zinc-900 uppercase shadow-sm dark:border-white/5 dark:bg-zinc-800 dark:text-zinc-100">
                      Timezone: {event.timezone || 'UTC'}
                    </span>
                  </div>
                </div>

                {/* Title & Tags */}
                <div className="space-y-4">
                  <h2 className="text-foreground text-3xl leading-[1.1] font-black tracking-tighter italic sm:text-4xl">
                    {event.title}
                  </h2>

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            'text-xs font-black tracking-widest uppercase',
                            category?.color
                              .replace('bg-', 'text-')
                              .replace('-500', '-600 dark:text-')
                              .concat('-400') || 'text-primary',
                          )}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status & Price */}
                <div className="flex items-center gap-3">
                  {event.is_free ? (
                    <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md">
                      Free Access
                    </span>
                  ) : (
                    event.price && (
                      <span className="rounded-full bg-amber-600 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md">
                        {event.price}
                      </span>
                    )
                  )}
                  {event.status && (
                    <span
                      className={cn(
                        'rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-md',
                        event.status === 'ongoing'
                          ? 'bg-primary animate-pulse'
                          : event.status === 'upcoming'
                            ? 'bg-blue-600'
                            : 'bg-zinc-600',
                      )}
                    >
                      {event.status}
                    </span>
                  )}
                </div>

                {/* Timeline - No Containers */}
                <div className="border-border grid grid-cols-1 gap-x-8 gap-y-3 border-y py-3 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-foreground text-[9px] font-black tracking-[0.3em] uppercase">
                        Start
                      </span>
                      <div className="text-foreground flex items-center gap-2 text-xs font-black tracking-tight">
                        <CalendarIcon className="text-primary h-3.5 w-3.5" />
                        <span>
                          {format(new Date(event.start_time), 'EEEE, d MMM yyyy • HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {event.end_time && (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground text-[9px] font-black tracking-[0.3em] uppercase">
                          End
                        </span>
                        <div className="text-foreground flex items-center gap-2 text-xs font-black tracking-tight">
                          <Clock className="text-primary h-3.5 w-3.5" />
                          <span>
                            {format(new Date(event.end_time), 'EEEE, d MMM yyyy • HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Extra Details - JSON Editor View */}
                {event.extra && Object.keys(event.extra).length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm" />
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm" />
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
                        </div>
                        <span className="text-foreground ml-3 text-[12px] font-black tracking-[0.4em] uppercase">
                          metadata.json
                        </span>
                      </div>
                    </div>

                    <div className="relative rounded-2xl border border-white/10 bg-black p-6 font-mono text-[11px] leading-[1.6] shadow-2xl">
                      <div className="custom-scrollbar max-h-[180px] overflow-y-auto pr-4 break-all whitespace-pre-wrap">
                        <span className="text-zinc-500">{'{'}</span>
                        {Object.entries(event.extra || {})
                          .filter(([key]) => !['description', 'title'].includes(key))
                          .map(([key, value], index, array) => (
                            <div key={key} className="flex gap-4 py-0.5 pl-4">
                              <span className="shrink-0 font-bold text-sky-400">"{key}":</span>
                              <span
                                className={cn(
                                  'flex-1 font-bold',
                                  typeof value === 'number'
                                    ? 'text-amber-400'
                                    : typeof value === 'boolean'
                                      ? 'text-purple-400'
                                      : 'text-emerald-400',
                                )}
                              >
                                {typeof value === 'string' ? `"${value}"` : String(value)}
                                {index < array.length - 1 ? (
                                  <span className="text-zinc-500">,</span>
                                ) : (
                                  ''
                                )}
                              </span>
                            </div>
                          ))}
                        <span className="text-zinc-500">{'}'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="bg-foreground text-background flex flex-[3] items-center justify-center gap-3 rounded-[2rem] px-6 py-4 text-[13px] font-black tracking-widest uppercase shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02] active:scale-98 dark:bg-white dark:text-black dark:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)]"
                    >
                      Register Now
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  )}
                  <button
                    onClick={handleSync}
                    disabled={isSyncing || isSynced}
                    className={cn(
                      'flex flex-[2] items-center justify-center gap-3 rounded-[2rem] border-2 px-6 py-4 text-[13px] font-black tracking-widest uppercase transition-all disabled:opacity-50',
                      isSynced
                        ? 'border-emerald-400 bg-emerald-500 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]'
                        : 'bg-background/80 text-foreground border-border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]',
                    )}
                  >
                    {isSyncing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <InfinityIcon className="h-5 w-5" />
                      </motion.div>
                    ) : isSynced ? (
                      <>
                        <Check className="h-5 w-5" />
                        Done
                      </>
                    ) : (
                      <>
                        <GoogleIcon />
                        {isAuthorized ? 'Sync' : 'Connect'}
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 space-y-3">
                    <p className="text-destructive px-4 text-center text-xs font-bold">{error}</p>
                    {isServiceDisabled && (
                      <a
                        href="https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=490341439860"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary block w-full text-center text-[10px] font-black tracking-widest uppercase hover:underline"
                      >
                        Click here to enable the API
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
