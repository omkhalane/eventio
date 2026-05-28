import { format } from 'date-fns';
import {
  ArrowLeft,
  Bookmark,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  MapPin,
  Share2,
  Shield,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { buildApiUrl } from '../lib/api';
import { cn } from '../lib/utils';
import { CalendarEvent } from '../types';
import { Footer } from './Footer';
import { CategoryBackgroundArt, getCategoryTheme } from './MainCalendar';
import { SeoHead } from './SeoHead';
import ShareDialog from './ShareDialog';

const CATEGORY_IMAGES: Record<string, string[]> = {
  competitive_programming: [
    'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
  ],
  global_competition: [
    'https://images.unsplash.com/photo-1567427017947-545c5f89c6ad?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
  ],
  startup: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=600&auto=format&fit=crop',
  ],
  hackathon: [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop',
  ],
  hiring_challenge: [
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521791136364-728647526955?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
  ],
  data_science: [
    'https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  ],
  ai_ml: [
    'https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  ],
  community_event: [
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
  ],
  web_development: [
    'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
  ],
  conference: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop',
  ],
  cybersecurity_ctf: [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=600&auto=format&fit=crop',
  ],
  open_source: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556075798-482a62c15f3e?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop',
  ],
  live_stream: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1610116306796-6ebd30d79141?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=600&auto=format&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
  ],
};

const getCategorySolidColorClass = (type?: string) => {
  switch (type) {
    case 'competitive_programming':
      return 'bg-amber-500';
    case 'hackathon':
      return 'bg-purple-500';
    case 'data_science':
    case 'ai_ml':
      return 'bg-cyan-500';
    case 'global_competition':
    case 'startup':
      return 'bg-yellow-500';
    case 'hiring_challenge':
      return 'bg-orange-500';
    case 'community_event':
    case 'web_development':
      return 'bg-blue-500';
    case 'cybersecurity_ctf':
      return 'bg-red-500';
    case 'open_source':
      return 'bg-emerald-500';
    case 'live_stream':
      return 'bg-rose-500';
    default:
      return 'bg-slate-500';
  }
};


export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const navTranslateY = useTransform(scrollY, [0, 100], [-20, 0]);

  const [isBookmarked, setIsBookmarked] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const bookmarks = JSON.parse(localStorage.getItem('eventio-bookmarks') || '[]');
      return Array.isArray(bookmarks) && slug ? bookmarks.includes(slug) : false;
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
      return false;
    }
  });

  const categoryImage = React.useMemo(() => {
    if (!event) return '';
    const list = CATEGORY_IMAGES[event.event_type || ''] || CATEGORY_IMAGES.default;
    // Use event.id to select a deterministic random index so it doesn't change on every render
    const idNum = event.id ? String(event.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const randomIndex = idNum % list.length;
    return list[randomIndex];
  }, [event]);

  const trackClick = () => {
    if (!slug) return;
    fetch(buildApiUrl(`/api/v1/events/${slug}/track`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click' }),
    }).catch((e) => console.warn('Failed to track click:', e));
  };

  const toggleBookmark = () => {
    if (!slug || !event) return;
    try {
      const bookmarks = JSON.parse(localStorage.getItem('eventio-bookmarks') || '[]');
      const savedEvents = JSON.parse(localStorage.getItem('eventio-bookmarked-events-data') || '[]');

      let nextBookmarks = [];
      let nextEvents = [];

      if (bookmarks.includes(slug)) {
        nextBookmarks = bookmarks.filter((b: string) => b !== slug);
        nextEvents = savedEvents.filter((e: CalendarEvent) => e.slug !== slug);
        setIsBookmarked(false);
      } else {
        nextBookmarks = [...bookmarks, slug];
        nextEvents = [...savedEvents, event];
        setIsBookmarked(true);
        
        fetch(buildApiUrl(`/api/v1/events/${slug}/track`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'bookmark' }),
        }).catch((e) => console.warn('Failed to track bookmark:', e));
      }

      localStorage.setItem('eventio-bookmarks', JSON.stringify(nextBookmarks));
      localStorage.setItem('eventio-bookmarked-events-data', JSON.stringify(nextEvents));
      
      window.dispatchEvent(new Event('eventio-bookmarks-updated'));
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
  };

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true);
      try {
        const res = await fetch(buildApiUrl(`/api/v1/events/${slug}`));
        if (!res.ok) {
          if (res.status === 404) throw new Error('Event not found');
          throw new Error('Failed to fetch event');
        }
        const json = await res.json();
        setEvent(json.data);

        fetch(buildApiUrl(`/api/v1/events/${slug}/track`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'view' }),
        }).catch((e) => console.warn('Failed to track view:', e));
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) fetchEvent();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-sm font-black tracking-[0.5em] text-slate-400 uppercase"
        >
          Loading Event
        </motion.div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <SeoHead
          title="Event Not Found | Eventio"
          description="The event you are looking for does not exist."
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-8xl font-black tracking-tighter text-slate-800 uppercase">404</h1>
          <p className="font-bold tracking-widest text-slate-500 uppercase">
            {error || 'Event not found'}
          </p>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-xs font-black tracking-widest text-white uppercase transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Calendar
          </Link>
        </motion.div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;
  const theme = getCategoryTheme(event.event_type);

  return (
    <div className={cn("flex min-h-screen flex-col text-slate-950 selection:bg-slate-900 selection:text-white transition-colors duration-300", theme.bg)}>
      <SeoHead
        title={`${event.title} | Eventio`}
        description={event.shortDescription || event.description || ''}
        canonicalPath={`/events/${event.slug}`}
        image={`/api/og/event/${event.slug}`}
      />

      {/* Floating Top Nav */}
      <motion.nav
        style={{ opacity: navOpacity, y: navTranslateY }}
        className="pointer-events-none fixed inset-x-0 top-6 z-[100] mx-auto max-w-5xl px-6"
      >
        <div
          className={cn(
            'pointer-events-auto flex items-center justify-between rounded-full border px-6 py-3 shadow-2xl backdrop-blur-xl bg-white/95',
            theme.baseBorder,
          )}
        >
          <div className="flex items-center gap-4">
            <Link to="/calendar" className="text-slate-600 transition-colors hover:text-slate-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span
              className={cn(
                'max-w-[200px] truncate text-xs font-black tracking-widest uppercase',
                theme.text,
              )}
            >
              {event.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleBookmark}
              className={cn(
                "p-2 rounded-full transition-colors",
                isBookmarked ? "text-amber-500 hover:text-amber-600" : "text-slate-600 hover:text-slate-900"
              )}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Event"}
            >
              <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-current" : "")} />
            </button>
            <button
              onClick={() => setIsShareOpen(true)}
              className="text-slate-600 transition-colors hover:text-slate-900"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className={cn(
                'rounded-full px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-transform hover:scale-105',
                theme.platformBg,
              )}
            >
              Register
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden px-6 pt-32 pb-20"
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          {categoryImage && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={categoryImage}
                alt=""
                className="h-full w-full object-cover opacity-25 mix-blend-overlay scale-105 filter blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-white/50 to-white/90" />
            </div>
          )}
          <div
            className={cn(
              'absolute top-0 left-1/4 h-full w-full animate-pulse rounded-full blur-[120px]',
              theme.bg.replace('bg-', 'bg-').replace('50', '500/40'),
            )}
          />
          <div
            className={cn(
              'absolute right-1/4 bottom-0 h-full w-full animate-pulse rounded-full blur-[120px] delay-700',
              theme.bg.replace('bg-', 'bg-').replace('50', '500/40'),
            )}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.02)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent)] bg-[size:40px_40px]" />
          <CategoryBackgroundArt
            category={event.event_type}
            className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.40] transition-opacity duration-500"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap gap-3"
            >
              <span
                className={cn(
                  'rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase bg-white/80 border backdrop-blur-md',
                  theme.text,
                  theme.baseBorder,
                )}
              >
                {event.platform.toUpperCase()}
              </span>
              <span
                className={cn(
                  'rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase bg-white/80 border backdrop-blur-md',
                  theme.text,
                  theme.baseBorder,
                )}
              >
                {event.event_type.toUpperCase()}
              </span>
              {event.is_free && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-100 px-4 py-1.5 text-[10px] font-black tracking-widest text-emerald-800 uppercase backdrop-blur-md">
                  FREE ACCESS
                </span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'text-6xl leading-[0.9] font-black tracking-tighter uppercase md:text-8xl filter drop-shadow-sm',
                theme.titleText,
              )}
            >
              {event.title}
            </motion.h1>

            {/* LOWERCASE HASHTAGS BELOW TITLE */}
            {event.tags && event.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2"
              >
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full bg-white/60 px-3.5 py-1 text-[11px] font-black tracking-wider uppercase border border-black/5 backdrop-blur-sm shadow-sm",
                      theme.text
                    )}
                  >
                    #{tag.toLowerCase()}
                  </span>
                ))}
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                'max-w-2xl text-lg leading-relaxed font-semibold md:text-xl filter drop-shadow-sm',
                theme.descText,
              )}
            >
              {event.shortDescription || event.description?.slice(0, 200) + '...'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                onClick={trackClick}
                className={cn(
                  'rounded-full px-10 py-5 text-xs font-black tracking-widest uppercase shadow-2xl transition-transform hover:scale-[1.05] active:scale-95',
                  theme.platformBg,
                )}
              >
                Register Now
              </a>
              <button
                onClick={toggleBookmark}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-10 py-5 text-xs font-black tracking-widest uppercase transition-colors bg-white/60 backdrop-blur-sm',
                  theme.baseBorder,
                  theme.text,
                  'hover:' + theme.hoverBorder,
                )}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-current text-amber-500" : "")} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              <button
                onClick={() => setIsShareOpen(true)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-10 py-5 text-xs font-black tracking-widest uppercase transition-colors bg-white/60 backdrop-blur-sm',
                  theme.baseBorder,
                  theme.text,
                  'hover:' + theme.hoverBorder,
                )}
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Metadata Strip */}
      <div
        className={cn(
          "sticky top-0 z-50 border-y border-black/10 backdrop-blur-xl shadow-lg transition-all duration-300",
          getCategorySolidColorClass(event.event_type)
        )}
      >
        <div
          className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-8 px-6 py-5 text-xs font-black tracking-widest uppercase text-black"
        >
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 stroke-[2.5] text-black" />
              <span>{format(startDate, 'EEEE, d MMMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 stroke-[2.5] text-black" />
              <span>
                {format(startDate, 'HH:mm')} {event.timezone || 'UTC'}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 stroke-[2.5] text-black" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 stroke-[2.5] text-black" />
              <span>
                {event.is_free ? 'FREE ACCESS' : event.price || 'PAID'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 stroke-[2.5] text-black" />
              <span>{event.mode || 'ONLINE'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-20 px-6 py-24 lg:grid-cols-[1fr_360px]">
        <div className="space-y-24">
          {/* About Section */}
          <section className="space-y-10">
            <h2
              className={cn(
                'text-xs font-black tracking-[0.4em] uppercase italic',
                theme.mutedText,
              )}
            >
              About the event
            </h2>
            <div
              className={cn(
                'prose max-w-none text-lg leading-relaxed whitespace-pre-wrap selection:bg-slate-900 selection:text-white',
                theme.descText,
              )}
            >
              {event.description || event.shortDescription || 'No detailed description available.'}
            </div>
          </section>

          {/* Timeline Section */}
          <section className="space-y-10">
            <h2
              className={cn(
                'text-xs font-black tracking-[0.4em] uppercase italic',
                theme.mutedText,
              )}
            >
              Event Timeline
            </h2>
            <div className="relative ml-6 pl-10 border-l-4 border-dashed" style={{ borderColor: getCategorySolidColorClass(event.event_type).replace('bg-', '#') === '#slate-500' ? '#64748b' : undefined }}>
              {/* Vertical dotted track with dynamic category color */}
              <div 
                className="absolute inset-y-0 -left-[4px] w-1 border-l-4 border-dashed" 
                style={{ borderColor: getCategorySolidColorClass(event.event_type).replace('bg-amber-500', '#f59e0b').replace('bg-purple-500', '#a855f7').replace('bg-cyan-500', '#06b6d4').replace('bg-yellow-500', '#eab308').replace('bg-orange-500', '#f97316').replace('bg-blue-500', '#3b82f6').replace('bg-red-500', '#ef4444').replace('bg-emerald-500', '#10b981').replace('bg-rose-500', '#f43f5e').replace('bg-slate-500', '#64748b') }} 
              />

              {/* Start Timeline Node */}
              <div className="relative pb-16">
                {/* Node Circle */}
                <div
                  className="absolute top-1.5 -left-[54px] flex h-7 w-7 items-center justify-center rounded-full border-4 shadow-md bg-white transition-transform hover:scale-110"
                  style={{ borderColor: getCategorySolidColorClass(event.event_type).replace('bg-amber-500', '#f59e0b').replace('bg-purple-500', '#a855f7').replace('bg-cyan-500', '#06b6d4').replace('bg-yellow-500', '#eab308').replace('bg-orange-500', '#f97316').replace('bg-blue-500', '#3b82f6').replace('bg-red-500', '#ef4444').replace('bg-emerald-500', '#10b981').replace('bg-rose-500', '#f43f5e').replace('bg-slate-500', '#64748b') }}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full animate-ping"
                    style={{ backgroundColor: getCategorySolidColorClass(event.event_type).replace('bg-amber-500', '#f59e0b').replace('bg-purple-500', '#a855f7').replace('bg-cyan-500', '#06b6d4').replace('bg-yellow-500', '#eab308').replace('bg-orange-500', '#f97316').replace('bg-blue-500', '#3b82f6').replace('bg-red-500', '#ef4444').replace('bg-emerald-500', '#10b981').replace('bg-rose-500', '#f43f5e').replace('bg-slate-500', '#64748b') }}
                  />
                  <div
                    className="absolute h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: getCategorySolidColorClass(event.event_type).replace('bg-amber-500', '#f59e0b').replace('bg-purple-500', '#a855f7').replace('bg-cyan-500', '#06b6d4').replace('bg-yellow-500', '#eab308').replace('bg-orange-500', '#f97316').replace('bg-blue-500', '#3b82f6').replace('bg-red-500', '#ef4444').replace('bg-emerald-500', '#10b981').replace('bg-rose-500', '#f43f5e').replace('bg-slate-500', '#64748b') }}
                  />
                </div>
                
                {/* Node Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase text-white shadow-sm"
                      style={{ backgroundColor: getCategorySolidColorClass(event.event_type).replace('bg-amber-500', '#f59e0b').replace('bg-purple-500', '#a855f7').replace('bg-cyan-500', '#06b6d4').replace('bg-yellow-500', '#eab308').replace('bg-orange-500', '#f97316').replace('bg-blue-500', '#3b82f6').replace('bg-red-500', '#ef4444').replace('bg-emerald-500', '#10b981').replace('bg-rose-500', '#f43f5e').replace('bg-slate-500', '#64748b') }}
                    >
                      Start
                    </span>
                    <span className={cn('text-xs font-black uppercase tracking-wider', theme.mutedText)}>
                      {format(startDate, 'EEEE')}
                    </span>
                  </div>
                  <h4 className={cn('text-2xl font-black tracking-tight uppercase', theme.titleText)}>
                    {format(startDate, 'd MMMM yyyy')}
                  </h4>
                  <p className={cn('text-sm font-black', theme.text)}>
                    {format(startDate, 'HH:mm')} {event.timezone || 'UTC'}
                  </p>
                  <p className={cn('text-sm opacity-80', theme.descText)}>
                    The event officially begins. Get ready to participate and build!
                  </p>
                </div>
              </div>

              {/* End Timeline Node */}
              {endDate && (
                <div className="relative animate-fade-in">
                  {/* Node Circle */}
                  <div
                    className="absolute top-1.5 -left-[54px] flex h-7 w-7 items-center justify-center rounded-full border-4 shadow-md bg-white transition-transform hover:scale-110"
                    style={{ borderColor: getCategorySolidColorClass(event.event_type).replace('bg-amber-500', '#f59e0b').replace('bg-purple-500', '#a855f7').replace('bg-cyan-500', '#06b6d4').replace('bg-yellow-500', '#eab308').replace('bg-orange-500', '#f97316').replace('bg-blue-500', '#3b82f6').replace('bg-red-500', '#ef4444').replace('bg-emerald-500', '#10b981').replace('bg-rose-500', '#f43f5e').replace('bg-slate-500', '#64748b') }}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getCategorySolidColorClass(event.event_type).replace('bg-amber-500', '#f59e0b').replace('bg-purple-500', '#a855f7').replace('bg-cyan-500', '#06b6d4').replace('bg-yellow-500', '#eab308').replace('bg-orange-500', '#f97316').replace('bg-blue-500', '#3b82f6').replace('bg-red-500', '#ef4444').replace('bg-emerald-500', '#10b981').replace('bg-rose-500', '#f43f5e').replace('bg-slate-500', '#64748b') }}
                    />
                  </div>
                  
                  {/* Node Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase text-white shadow-sm bg-slate-500"
                      >
                        End
                      </span>
                      <span className={cn('text-xs font-black uppercase tracking-wider', theme.mutedText)}>
                        {format(endDate, 'EEEE')}
                      </span>
                    </div>
                    <h4 className={cn('text-2xl font-black tracking-tight uppercase', theme.titleText)}>
                      {format(endDate, 'd MMMM yyyy')}
                    </h4>
                    <p className={cn('text-sm font-black', theme.text)}>
                      {format(endDate, 'HH:mm')} {event.timezone || 'UTC'}
                    </p>
                    <p className={cn('text-sm opacity-80', theme.descText)}>
                      The event officially concludes. Submissions lock and evaluation begins!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Prizes / Benefits */}
          {event.prizes && (
            <section className="space-y-10">
              <h2
                className={cn(
                  'text-xs font-black tracking-[0.4em] uppercase italic',
                  theme.mutedText,
                )}
              >
                Prizes & Benefits
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div
                  className={cn(
                    'space-y-4 rounded-3xl border p-8 bg-white/90 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:bg-white',
                    theme.baseBorder,
                  )}
                >
                  <Trophy className={cn('h-10 w-10', theme.text)} />
                  <h4
                    className={cn('text-2xl font-black tracking-tight uppercase', theme.titleText)}
                  >
                    Main Rewards
                  </h4>
                  <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', theme.descText)}>
                    {event.prizes}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <section className="space-y-10">
              <h2
                className={cn(
                  'text-xs font-black tracking-[0.4em] uppercase italic',
                  theme.mutedText,
                )}
              >
                Skills & Categories
              </h2>
              <div className="flex flex-wrap gap-3">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'cursor-default rounded-2xl border px-6 py-3 text-xs font-bold transition-all bg-white/60 hover:bg-white',
                      theme.badgeBg,
                    )}
                  >
                    #{tag.toUpperCase()}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="sticky top-28 space-y-8">
            <div
              className={cn(
                'space-y-8 rounded-[2.5rem] border p-10 shadow-2xl backdrop-blur-2xl bg-white/95 transition-all duration-300 hover:shadow-3xl',
                theme.baseBorder,
              )}
            >
              <div className="space-y-4">
                <a
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={trackClick}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-full py-6 text-xs font-black tracking-widest uppercase transition-transform hover:scale-[1.02] active:scale-98',
                    theme.platformBg,
                  )}
                >
                  Register Now <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={toggleBookmark}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-full border py-6 text-xs font-black tracking-widest uppercase transition-all bg-white/60 backdrop-blur-sm',
                    theme.baseBorder,
                    theme.text,
                    'hover:' + theme.hoverBorder,
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", isBookmarked ? "fill-current text-amber-500" : "")} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark Event'}
                </button>
                <button
                  onClick={() => setIsShareOpen(true)}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-full border py-6 text-xs font-black tracking-widest uppercase transition-colors bg-white/60 backdrop-blur-sm',
                    theme.baseBorder,
                    theme.text,
                    'hover:' + theme.hoverBorder,
                  )}
                >
                  <Share2 className="h-4 w-4" /> Share Event
                </button>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[10px] font-black tracking-widest uppercase italic',
                      theme.mutedText,
                    )}
                  >
                    Platform
                  </span>
                  <span className={cn('text-xs font-black uppercase', theme.text)}>
                    {event.platform}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[10px] font-black tracking-widest uppercase italic',
                      theme.mutedText,
                    )}
                  >
                    Mode
                  </span>
                  <span className={cn('text-xs font-black uppercase', theme.text)}>
                    {event.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {event.organizerName && (
              <div
                className={cn(
                  'space-y-6 rounded-[2.5rem] border p-10 bg-white/90 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white',
                  theme.baseBorder,
                )}
              >
                <div className="flex items-center gap-4">
                  {event.organizerLogo ? (
                    <img
                      src={event.organizerLogo}
                      className={cn('h-12 w-12 rounded-full border p-1', theme.baseBorder)}
                      alt=""
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full',
                        theme.bg,
                        theme.baseBorder,
                      )}
                    >
                      <User className={cn('h-6 w-6', theme.mutedText)} />
                    </div>
                  )}
                  <div>
                    <p
                      className={cn(
                        'text-[8px] font-black tracking-widest uppercase',
                        theme.mutedText,
                      )}
                    >
                      Organizer
                    </p>
                    <h5
                      className={cn('text-sm font-black tracking-tight uppercase', theme.titleText)}
                    >
                      {event.organizerName}
                    </h5>
                  </div>
                </div>
                <p className={cn('text-xs leading-relaxed', theme.descText)}>
                  Official event organized by {event.organizerName} and indexed on Eventio.
                </p>
                {event.organizerUrl && (
                  <a
                    href={event.organizerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'flex items-center gap-1 text-[10px] font-black tracking-widest uppercase hover:underline',
                      theme.text,
                    )}
                  >
                    Link to profile <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Sticky Mobile CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-[100] border-t p-4 backdrop-blur-xl lg:hidden"
        style={{ borderColor: theme.baseBorder }}
      >
        <div className="flex gap-4">
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            onClick={trackClick}
            className={cn(
              'flex-[3] rounded-full py-4 text-center text-[10px] font-black tracking-widest uppercase shadow-xl',
              theme.platformBg,
            )}
          >
            Register Now
          </a>
          <button
            onClick={() => setIsShareOpen(true)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-full border p-4',
              theme.baseBorder,
              theme.text,
              'hover:' + theme.hoverBorder,
            )}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Footer />

      <ShareDialog event={event} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}
