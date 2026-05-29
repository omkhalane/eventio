import { format } from 'date-fns';
import {
  Bookmark,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  MapPin,
  MousePointerClick,
  Share2,
  Trophy,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { CATEGORIES } from '../constants';
import { buildApiUrl } from '../lib/api';
import { setLastOpenedEvent } from '../lib/recentEvent';
import { cn } from '../lib/utils';
import { syncEventToGoogle } from '../services/googleCalendarService';
import { CalendarEvent } from '../types';
import { CategoryBackgroundArt } from './MainCalendar';
import ShareDialog from './ShareDialog';

const getCategoryModalStyles = (type?: string) => {
  switch (type) {
    case 'competitive_programming':
      return 'border-amber-500/40 shadow-[0_32px_128px_-16px_rgba(245,158,11,0.15)] bg-amber-100';
    case 'hackathon':
      return 'border-purple-500/40 shadow-[0_32px_128px_-16px_rgba(168,85,247,0.15)] bg-purple-100';
    case 'data_science':
    case 'ai_ml':
      return 'border-cyan-500/40 shadow-[0_32px_128px_-16px_rgba(6,182,212,0.15)] bg-cyan-100';
    case 'global_competition':
    case 'startup':
      return 'border-yellow-600/40 shadow-[0_32px_128px_-16px_rgba(234,179,8,0.15)] bg-yellow-100';
    case 'hiring_challenge':
      return 'border-orange-500/40 shadow-[0_32px_128px_-16px_rgba(249,115,22,0.15)] bg-orange-100';
    case 'community_event':
    case 'web_development':
      return 'border-blue-500/40 shadow-[0_32px_128px_-16px_rgba(59,130,246,0.15)] bg-blue-100';
    case 'cybersecurity_ctf':
      return 'border-red-500/40 shadow-[0_32px_128px_-16px_rgba(239,68,68,0.15)] bg-red-100';
    case 'open_source':
      return 'border-emerald-500/40 shadow-[0_32px_128px_-16px_rgba(16,185,129,0.15)] bg-emerald-100';
    default:
      return 'border-slate-300 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] bg-slate-100';
  }
};

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

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  isGoogleAuthorized?: boolean;
  isMicrosoftAuthorized?: boolean;
  onGoogleSignIn?: () => Promise<void>;
  onMicrosoftSignIn?: () => Promise<void>;
}

const _GoogleIcon = () => (
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

export default function EventModal({
  event,
  onClose,
  isGoogleAuthorized,
  isMicrosoftAuthorized,
  onGoogleSignIn,
  onMicrosoftSignIn,
}: EventModalProps) {
  const [isSynced, setIsSynced] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!event?.slug) return;
    fetch(buildApiUrl(`/api/v1/events/${event.slug}/track`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view' }),
    }).catch((e) => console.warn('Failed to track view in modal:', e));
  }, [event?.slug]);

  useEffect(() => {
    if (!event) return;
    try {
      const savedSlugs = JSON.parse(localStorage.getItem('eventio-bookmarks') || '[]');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsBookmarked(savedSlugs.includes(event.slug));
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
  }, [event, event?.slug]);

  useEffect(() => {
    if (event) {
      setLastOpenedEvent(event, 'modal');
    }
  }, [event]);

  useEffect(() => {
    if (!event) return;

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== 'Escape') return;

      keyboardEvent.preventDefault();
      if (isShareOpen) {
        setIsShareOpen(false);
        return;
      }

      onClose();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [event, isShareOpen, onClose]);

  const handleTrackClick = () => {
    if (!event?.slug) return;
    fetch(buildApiUrl(`/api/v1/events/${event.slug}/track`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click' }),
    }).catch((e) => console.warn('Failed to track click in modal:', e));
  };

  const handleToggleBookmark = () => {
    if (!event) return;
    try {
      const savedSlugs = JSON.parse(localStorage.getItem('eventio-bookmarks') || '[]');
      const savedEvents = JSON.parse(
        localStorage.getItem('eventio-bookmarked-events-data') || '[]',
      );

      let nextSlugs: string[];
      let nextEvents: CalendarEvent[];
      const isNowBookmarked = !isBookmarked;

      if (savedSlugs.includes(event.slug)) {
        nextSlugs = savedSlugs.filter((s: string) => s !== event.slug);
        nextEvents = savedEvents.filter((e: CalendarEvent) => e.slug !== event.slug);
      } else {
        nextSlugs = [...savedSlugs, event.slug];
        nextEvents = [...savedEvents, event];

        fetch(buildApiUrl(`/api/v1/events/${event.slug}/track`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'bookmark' }),
        }).catch((e) => console.warn('Failed to track bookmark in modal:', e));
      }

      localStorage.setItem('eventio-bookmarks', JSON.stringify(nextSlugs));
      localStorage.setItem('eventio-bookmarked-events-data', JSON.stringify(nextEvents));
      setIsBookmarked(isNowBookmarked);

      window.dispatchEvent(new Event('eventio-bookmarks-updated'));
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
  };

  const categoryImage = React.useMemo(() => {
    if (!event) return '';
    const list = CATEGORY_IMAGES[event.event_type || ''] || CATEGORY_IMAGES.default;
    const idNum = event.id
      ? String(event.id)
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : 0;
    const randomIndex = idNum % list.length;
    return list[randomIndex];
  }, [event]);

  if (!event) return null;

  const handleSync = async (provider: 'google' | 'microsoft' | 'apple') => {
    try {
      if (provider === 'google') {
        if (!isGoogleAuthorized && onGoogleSignIn) {
          await onGoogleSignIn();
        }
        await syncEventToGoogle(event);
      } else if (provider === 'microsoft') {
        if (!isMicrosoftAuthorized && onMicrosoftSignIn) {
          await onMicrosoftSignIn();
        }
        const { syncEventToMicrosoft } = await import('../services/microsoftCalendarService');
        await syncEventToMicrosoft(event);
      } else if (provider === 'apple') {
        const { downloadIcsFile } = await import('../services/appleCalendarService');
        downloadIcsFile(event);
      }
      setIsSynced(true);
      setTimeout(() => setIsSynced(false), 3000);
    } catch (err: any) {
      console.error('Failed to sync event:', err);
    }
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  const category = CATEGORIES.find((c) => c.id === event.event_type);
  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;

  const badges = [
    event.platform.toUpperCase(),
    category?.label.toUpperCase(),
    event.mode?.toUpperCase(),
    isBookmarked ? 'REGISTERED' : null,
    event.is_free ? 'FREE' : null,
  ].filter(Boolean);

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          data-event-modal-content="true"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className={cn(
            'relative flex h-[90vh] max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border transition-all duration-300',
            getCategoryModalStyles(event.event_type),
          )}
        >
          {/* Top Controls: Bookmark and Close */}
          <div className="absolute top-6 right-6 z-[110] flex items-center gap-3">
            <button
              onClick={handleToggleBookmark}
              className={cn(
                'rounded-full bg-black/20 p-2 backdrop-blur-md transition-colors hover:bg-black/40',
                isBookmarked ? 'text-emerald-400' : 'text-white',
              )}
              title={isBookmarked ? 'Saved' : 'Bookmark Event'}
            >
              <Bookmark className={cn('h-5 w-5', isBookmarked ? 'fill-current' : '')} />
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto">
            {/* Hero Section */}
            <div className="relative flex min-h-[340px] w-full flex-col justify-end overflow-hidden p-8 sm:p-12">
              {/* Background Image/Gradient */}
              <div className="absolute inset-0 z-0">
                <img src={categoryImage} alt="" className="h-full w-full object-cover opacity-15" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent" />
                <CategoryBackgroundArt
                  category={event.event_type}
                  className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.18]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50" />
              </div>

              {/* Floating Badges */}
              <div className="absolute top-8 left-8 z-10 flex flex-wrap gap-2 sm:left-12">
                {badges.map((badge, i) => (
                  <motion.span
                    key={badge}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="rounded-full border border-white/40 bg-white/20 px-4 py-1.5 text-[10px] font-black tracking-widest text-zinc-900 uppercase backdrop-blur-xl"
                  >
                    {badge}
                  </motion.span>
                ))}
              </div>

              {/* Title & Info */}
              <div className="relative z-10 space-y-6">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl text-4xl leading-[0.9] font-black tracking-tighter text-zinc-900 uppercase sm:text-6xl"
                >
                  {event.title}
                </motion.h2>

                <div className="flex items-center gap-4">
                  {event.organizerLogo && (
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
                      <img src={event.organizerLogo} alt="" className="object-contain" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-xs font-bold tracking-widest text-zinc-600 uppercase">
                      Organized by
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black tracking-wider text-zinc-900 uppercase">
                        {event.organizerName || event.platform}
                      </span>
                      {event.organizerName && (
                        <Check className="h-3.5 w-3.5 rounded-full bg-blue-500 p-0.5 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills/Tags */}
                {event.skills?.length || event.tags?.length ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[...(event.skills || []), ...(event.tags || [])].map((item, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-black/10 bg-white/40 px-3 py-1 text-[11px] font-bold text-zinc-800 backdrop-blur-md"
                      >
                        #{item.toUpperCase()}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Meta Information Strip */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-slate-200 bg-white/80 px-8 py-4 text-[10px] font-black tracking-widest text-slate-600 uppercase backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                {format(startDate, 'MMM d')}
                {endDate && ` - ${format(endDate, 'd, yyyy')}`}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {format(startDate, 'h:mm a')} {event.timezone || 'PST'}
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {event.location}
                </div>
              )}
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  {event.views || 0}
                </div>
                <div className="flex items-center gap-1.5">
                  <MousePointerClick className="h-3.5 w-3.5 text-slate-400" />
                  {event.clicks || 0}
                </div>
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                  {event.bookmarks || 0}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-12 p-8 sm:p-12 lg:grid-cols-[1fr_300px]">
              {/* Left Column: Description */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <div
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="group flex cursor-pointer items-center justify-between"
                  >
                    <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      Description
                    </h3>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-slate-500 transition-transform',
                        isDescriptionExpanded ? 'rotate-180' : '',
                      )}
                    />
                  </div>
                  <AnimatePresence>
                    {isDescriptionExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6">
                          <h4 className="text-xl font-black tracking-tight text-zinc-900">
                            About the event
                          </h4>
                          <div className="custom-scrollbar max-h-[250px] overflow-y-auto pr-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                            {event.description ||
                              event.shortDescription ||
                              'No detailed description available.'}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Info Cards */}
              <div className="space-y-4">
                {event.eligibility && (
                  <div className="space-y-2 rounded-2xl border border-slate-300 bg-slate-100 p-5">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">
                        Eligibility
                      </span>
                    </div>
                    <p className="text-xs font-black text-zinc-900 uppercase">
                      {event.eligibility}
                    </p>
                  </div>
                )}

                {event.maxTeamSize && (
                  <div className="space-y-2 rounded-2xl border border-slate-300 bg-slate-100 p-5">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">
                        Team Size
                      </span>
                    </div>
                    <p className="text-xs font-black text-zinc-900 uppercase">
                      {event.minTeamSize || 1}-{event.maxTeamSize} Members
                    </p>
                  </div>
                )}

                {event.prizes && (
                  <div className="space-y-2 rounded-2xl border border-slate-300 bg-slate-100 p-5">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Trophy className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">
                        Prizes
                      </span>
                    </div>
                    <p className="text-xs font-black text-zinc-900 uppercase">{event.prizes}</p>
                  </div>
                )}

                <div className="space-y-2 rounded-2xl border border-slate-300 bg-slate-100 p-5">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black tracking-widest uppercase">Price</span>
                  </div>
                  <p className="text-xs font-black text-zinc-900 uppercase">
                    {event.is_free ? 'Free for all' : event.price || 'Check source'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area (Fixed position at the bottom of the card) */}
          <div className="z-10 flex shrink-0 flex-wrap gap-4 border-t border-black/5 bg-inherit p-8 sm:p-12">
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              onClick={handleTrackClick}
              className="flex min-w-[200px] items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-xs font-black tracking-widest text-white uppercase shadow-xl transition-transform hover:scale-[1.02] active:scale-95"
            >
              Register Now
            </a>
            <Link
              to={`/events/${event.slug}`}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-xs font-black tracking-widest text-slate-900 uppercase transition-colors hover:bg-slate-50"
            >
              Visit <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-xs font-black tracking-widest text-slate-900 uppercase transition-colors hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <button
              onClick={() => {
                if (isMicrosoftAuthorized) {
                  handleSync('microsoft');
                } else {
                  handleSync('google');
                }
              }}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-4 text-xs font-black tracking-widest text-slate-900 uppercase transition-colors hover:bg-slate-50"
            >
              {isSynced ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <CalendarIcon className="h-3.5 w-3.5" />
              )}
              {isSynced ? 'Synced' : 'Add to Calendar'}
            </button>
          </div>
        </motion.div>
      </div>

      <ShareDialog
        event={event}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        captureSelector='[data-event-modal-content="true"]'
      />
    </AnimatePresence>
  );
}
