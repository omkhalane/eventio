import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import React, { useEffect, useMemo,useState } from 'react';
import { Link } from 'react-router-dom';

import { CATEGORIES } from '../constants';
import { buildApiUrl } from '../lib/api';
import { cn } from '../lib/utils';
import { CalendarEvent } from '../types';
import { Footer } from './Footer';
import Header from './Header';

const getCategoryStyles = (type: string) => {
  const styles: Record<string, { bg: string; text: string; border: string; glow: string; badge: string }> = {
    competitive_programming: {
      bg: 'bg-zinc-500/5 hover:bg-zinc-500/10 dark:bg-zinc-400/5 dark:hover:bg-zinc-400/10',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
      glow: 'shadow-zinc-500/5',
      badge: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    },
    global_competition: {
      bg: 'bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-400/5 dark:hover:bg-amber-400/10',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-750',
      glow: 'shadow-amber-500/5',
      badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
    },
    hackathon: {
      bg: 'bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-400/5 dark:hover:bg-purple-400/10',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200/50 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-750',
      glow: 'shadow-purple-500/5',
      badge: 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
    },
    hiring_challenge: {
      bg: 'bg-orange-500/5 hover:bg-orange-500/10 dark:bg-orange-400/5 dark:hover:bg-orange-400/10',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200/50 dark:border-orange-800/30 hover:border-orange-300 dark:hover:border-orange-750',
      glow: 'shadow-orange-500/5',
      badge: 'bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-900/50',
    },
    data_science: {
      bg: 'bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-400/5 dark:hover:bg-blue-400/10',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200/50 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-750',
      glow: 'shadow-blue-500/5',
      badge: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
    },
    community_event: {
      bg: 'bg-pink-500/5 hover:bg-pink-500/10 dark:bg-pink-400/5 dark:hover:bg-pink-400/10',
      text: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-200/50 dark:border-pink-800/30 hover:border-pink-300 dark:hover:border-pink-750',
      glow: 'shadow-pink-500/5',
      badge: 'bg-pink-50 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200 dark:border-pink-900/50',
    },
    conference: {
      bg: 'bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-400/5 dark:hover:bg-indigo-400/10',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200/50 dark:border-indigo-800/30 hover:border-indigo-300 dark:hover:border-indigo-750',
      glow: 'shadow-indigo-500/5',
      badge: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
    },
    cybersecurity_ctf: {
      bg: 'bg-red-500/5 hover:bg-red-500/10 dark:bg-red-400/5 dark:hover:bg-red-400/10',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200/50 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-750',
      glow: 'shadow-red-500/5',
      badge: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/50',
    },
    open_source: {
      bg: 'bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-400/5 dark:hover:bg-emerald-400/10',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-750',
      glow: 'shadow-emerald-500/5',
      badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
    },
    live_stream: {
      bg: 'bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-400/5 dark:hover:bg-rose-400/10',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200/50 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-750',
      glow: 'shadow-rose-500/5',
      badge: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
    },
  };
  return styles[type] || styles.competitive_programming;
};

export default function BookmarkedEventsPage() {
  const [bookmarkedEvents, setBookmarkedEvents] = useState<CalendarEvent[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const savedEvents = JSON.parse(localStorage.getItem('eventio-bookmarked-events-data') || '[]');
      return Array.isArray(savedEvents) ? savedEvents : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');

  const loadBookmarks = () => {
    try {
      const savedEvents = JSON.parse(localStorage.getItem('eventio-bookmarked-events-data') || '[]');
      if (Array.isArray(savedEvents)) {
        setBookmarkedEvents(savedEvents);
      }
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
  };

  useEffect(() => {
    window.addEventListener('eventio-bookmarks-updated', loadBookmarks);
    return () => window.removeEventListener('eventio-bookmarks-updated', loadBookmarks);
  }, []);

  const handleRemoveBookmark = (slug: string) => {
    try {
      const savedSlugs = JSON.parse(localStorage.getItem('eventio-bookmarks') || '[]');
      const savedEvents = JSON.parse(localStorage.getItem('eventio-bookmarked-events-data') || '[]');

      const nextSlugs = savedSlugs.filter((s: string) => s !== slug);
      const nextEvents = savedEvents.filter((e: CalendarEvent) => e.slug !== slug);

      localStorage.setItem('eventio-bookmarks', JSON.stringify(nextSlugs));
      localStorage.setItem('eventio-bookmarked-events-data', JSON.stringify(nextEvents));
      
      setBookmarkedEvents(nextEvents);
      window.dispatchEvent(new Event('eventio-bookmarks-updated'));
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
  };

  const handleTrackRegister = (slug: string) => {
    fetch(buildApiUrl(`/api/v1/events/${slug}/track`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click' }),
    }).catch((e) => console.warn('Failed to track click:', e));
  };

  const filteredAndSortedEvents = useMemo(() => {
    let result = bookmarkedEvents;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.platform.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    result = [...result].sort((a, b) => {
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      return sortBy === 'date-asc' ? timeA - timeB : timeB - timeA;
    });
    return result;
  }, [bookmarkedEvents, searchQuery, sortBy]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <Header />
      <div className="relative flex-1 overflow-hidden py-12 px-6 sm:px-12 lg:px-24 mt-20">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-500/5" />
        <div className="pointer-events-none absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/5" />

        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white/80 px-4 py-2 text-xs font-bold text-stone-600 shadow-xs backdrop-blur-xs transition-transform hover:scale-[1.02] active:scale-[0.98] dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Calendar
            </Link>
          </div>

          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                  <Bookmark className="h-4 w-4 fill-current" />
                </span>
                <span className="bg-amber-100 text-amber-800 border border-amber-200/50 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30">
                  Saved Offline
                </span>
              </div>
              <h1 className="mt-3 font-sans text-4xl font-black tracking-tighter sm:text-5xl">
                Bookmarked Events
              </h1>
              <p className="mt-2 text-stone-500 dark:text-stone-400 max-w-2xl text-sm font-medium">
                You have {bookmarkedEvents.length} saved offline event
                {bookmarkedEvents.length !== 1 && 's'}
              </p>
            </div>
            
            {bookmarkedEvents.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white/50 px-4 py-2 text-sm text-stone-900 shadow-sm backdrop-blur-md transition-colors placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-4 focus:ring-stone-500/10 dark:border-stone-800 dark:bg-stone-900/50 dark:text-white dark:placeholder:text-stone-600 dark:focus:border-stone-700 sm:w-48"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date-asc' | 'date-desc')}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white/50 px-4 py-2 text-sm font-bold text-stone-600 shadow-sm backdrop-blur-md transition-colors focus:border-stone-300 focus:outline-none focus:ring-4 focus:ring-stone-500/10 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-300 dark:focus:border-stone-700 sm:w-32"
                >
                  <option value="date-asc">Earliest</option>
                  <option value="date-desc">Latest</option>
                </select>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all bookmarks?')) {
                      localStorage.removeItem('eventio-bookmarks');
                      localStorage.removeItem('eventio-bookmarked-events-data');
                      setBookmarkedEvents([]);
                      window.dispatchEvent(new Event('eventio-bookmarks-updated'));
                    }
                  }}
                  className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {bookmarkedEvents.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white/50 py-24 px-6 text-center backdrop-blur-xs dark:border-stone-800 dark:bg-stone-900/20"
              >
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 animate-pulse-subtle">
                  <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400" />
                  <Bookmark className="h-10 w-10 fill-current" />
                </div>
                <h3 className="font-sans text-2xl font-black tracking-tight">Your bookmark roster is empty</h3>
                <p className="mt-2 max-w-md text-stone-500 dark:text-stone-400 text-sm font-medium">
                  Browse the master calendar, tap the bookmark triggers on event detail pages or modals, and watch your curated list grow here.
                </p>
                <Link
                  to="/calendar"
                  className="mt-8 flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 text-xs font-black tracking-widest text-white uppercase shadow-xl transition-transform hover:scale-[1.02] active:scale-95 dark:bg-white dark:text-stone-900"
                >
                  Explore Calendar
                </Link>
              </motion.div>
            ) : filteredAndSortedEvents.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center rounded-[2rem] border border-stone-200 border-dashed bg-white/30 py-24 text-center dark:border-stone-800 dark:bg-stone-900/20"
              >
                <p className="text-sm font-bold text-stone-400">No events match your search.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filteredAndSortedEvents.map((event) => {
                  const style = getCategoryStyles(event.event_type || 'default');
                  const categoryObj = CATEGORIES.find((c) => c.id === event.event_type);
                  const startDate = event.start_time ? new Date(event.start_time) : null;
                  
                  return (
                    <motion.div
                      key={event.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className={cn(
                        'group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-6 backdrop-blur-md transition-all duration-300 shadow-xs hover:shadow-xl',
                        style.bg,
                        style.border,
                        style.glow
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
                            {event.platform}
                          </span>
                          <span className={cn(
                            'rounded-full border px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase',
                            style.badge
                          )}>
                            {categoryObj?.label || event.event_type?.replace('_', ' ')}
                          </span>
                        </div>

                        <Link to={`/events/${event.slug}`} className="mt-4 block group-hover:underline">
                          <h3 className="font-sans text-lg font-bold leading-snug tracking-tight text-stone-900 dark:text-white line-clamp-2">
                            {event.title}
                          </h3>
                        </Link>

                        {startDate && (
                          <div className="mt-4 flex items-center gap-2 text-stone-500 dark:text-stone-400">
                            <Calendar className="h-4 w-4 shrink-0 text-stone-400" />
                            <span className="text-xs font-bold">
                              {startDate.toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {event.start_time && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-stone-300 dark:bg-stone-700" />
                                <Clock className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                                <span className="text-[10px] font-black tracking-wider">
                                  {startDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-stone-500 dark:text-stone-400">
                          <MapPin className="h-4 w-4 shrink-0 text-stone-400" />
                          <span className="text-xs font-bold capitalize">
                            {event.mode || (event.is_online ? 'online' : 'offline')}
                          </span>
                          {event.is_free && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-stone-300 dark:bg-stone-700" />
                              <span className="text-[10px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                                FREE ACCESS
                              </span>
                            </>
                          )}
                        </div>

                        {/* Tags list */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-1">
                            {event.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="bg-stone-200/50 text-stone-600 dark:bg-stone-800/50 dark:text-stone-400 rounded-lg px-2 py-0.5 text-[9px] font-bold"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card bottom actions */}
                      <div className="mt-8 flex gap-3">
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleTrackRegister(event.slug)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-stone-900 py-3 px-4 text-[10px] font-black tracking-widest text-white uppercase shadow-md transition-all hover:bg-stone-800 hover:scale-[1.02] active:scale-98 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                        >
                          Register <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => handleRemoveBookmark(event.slug)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-red-950 dark:hover:bg-red-950/20"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
