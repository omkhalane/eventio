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
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
  const [isSynced, setIsSynced] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);

  if (!event) return null;

  const handleSync = async () => {
    try {
      if (!isAuthorized && onSignIn) {
        await onSignIn();
      }
      await syncEventToGoogle(event);
      setIsSynced(true);
      setTimeout(() => setIsSynced(false), 3000);
    } catch (err: any) {
      console.error('Failed to sync event:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Check out ${event.title} on Eventio!`,
      url: window.location.origin + `/events/${event.slug}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="bg-black/60 absolute inset-0 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="bg-zinc-50 dark:bg-zinc-950 relative flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-[110] bg-black/20 hover:bg-black/40 text-white rounded-full p-2 backdrop-blur-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="custom-scrollbar overflow-y-auto">
            {/* Hero Section */}
            <div className="relative min-h-[340px] w-full overflow-hidden p-8 sm:p-12 flex flex-col justify-end">
              {/* Background Image/Gradient */}
              <div className="absolute inset-0 z-0">
                {event.bannerImage ? (
                  <>
                    <img
                      src={event.bannerImage}
                      alt=""
                      className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80" />
                  </>
                ) : (
                  <div
                    className={cn(
                      'h-full w-full opacity-20',
                      category?.color || 'bg-primary'
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-zinc-950" />
                  </div>
                )}
              </div>

              {/* Floating Badges */}
              <div className="absolute top-8 left-8 sm:left-12 flex flex-wrap gap-2 z-10">
                {badges.map((badge, i) => (
                  <motion.span
                    key={badge}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-zinc-900 dark:text-zinc-100 uppercase"
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
                  className="text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9] text-zinc-900 dark:text-zinc-50 uppercase max-w-2xl"
                >
                  {event.title}
                </motion.h2>

                <div className="flex items-center gap-4">
                  {event.organizerLogo && (
                    <div className="h-14 w-14 rounded-2xl bg-white border border-black/5 p-2 shadow-xl flex items-center justify-center overflow-hidden">
                      <img src={event.organizerLogo} alt="" className="object-contain" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold tracking-widest uppercase">
                      Organized by
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-900 dark:text-zinc-100 font-black tracking-wider uppercase text-sm">
                        {event.organizerName || event.platform}
                      </span>
                      {event.organizerName && (
                        <Check className="h-3.5 w-3.5 bg-blue-500 text-white rounded-full p-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Information Strip */}
            <div className="border-y border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm px-8 py-4 flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-black tracking-widest text-zinc-600 dark:text-zinc-400 uppercase">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
                {format(startDate, 'MMM d')}
                {endDate && ` - ${format(endDate, 'd, yyyy')}`}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                {format(startDate, 'h:mm a')} {event.timezone || 'PST'}
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {event.location}
                </div>
              )}
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-zinc-400" />
                  {event.views || 0}
                </div>
                <div className="flex items-center gap-1.5">
                  <MousePointerClick className="h-3.5 w-3.5 text-zinc-400" />
                  {event.clicks || 0}
                </div>
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                  {event.bookmarks || 0}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
              {/* Left Column: Description */}
              <div className="space-y-10">
                <div className="space-y-4">
                  <div
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Description</h3>
                    <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", isDescriptionExpanded ? "rotate-180" : "")} />
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
                          <h4 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">About the event</h4>
                          <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                            {event.description || event.shortDescription || "No detailed description available."}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Skills/Tags */}
                {(event.skills?.length || event.tags?.length) ? (
                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                     <div className="flex flex-wrap gap-2">
                        {[...(event.skills || []), ...(event.tags || [])].map((item, i) => (
                          <span key={i} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-lg text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                            #{item.toUpperCase()}
                          </span>
                        ))}
                     </div>
                  </div>
                ) : null}
              </div>

              {/* Right Column: Info Cards */}
              <div className="space-y-4">
                {event.eligibility && (
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">Eligibility</span>
                    </div>
                    <p className="text-zinc-900 dark:text-zinc-100 text-xs font-black uppercase">{event.eligibility}</p>
                  </div>
                )}

                {event.maxTeamSize && (
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">Team Size</span>
                    </div>
                    <p className="text-zinc-900 dark:text-zinc-100 text-xs font-black uppercase">
                      {event.minTeamSize || 1}-{event.maxTeamSize} Members
                    </p>
                  </div>
                )}

                {event.prizes && (
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Trophy className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">Prizes</span>
                    </div>
                    <p className="text-zinc-900 dark:text-zinc-100 text-xs font-black uppercase">{event.prizes}</p>
                  </div>
                )}

                <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black tracking-widest uppercase">Price</span>
                  </div>
                  <p className="text-zinc-900 dark:text-zinc-100 text-xs font-black uppercase">
                    {event.is_free ? 'Free for all' : (event.price || 'Check source')}
                  </p>
                </div>

                {event.organizerName && (
                  <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <User className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black tracking-widest uppercase">Organizer</span>
                    </div>
                    <div className="flex items-center gap-3">
                       {event.organizerLogo ? (
                         <img src={event.organizerLogo} alt="" className="h-8 w-8 rounded-full border border-black/10 p-0.5" />
                       ) : (
                         <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-zinc-400" />
                         </div>
                       )}
                       <div className="flex flex-col">
                          <span className="text-zinc-900 dark:text-zinc-100 text-[11px] font-black uppercase tracking-tight leading-none">
                            {event.organizerName}
                          </span>
                          {event.organizerUrl && (
                            <a href={event.organizerUrl} target="_blank" rel="noreferrer" className="text-blue-500 text-[10px] font-bold hover:underline">Link to profile</a>
                          )}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Area */}
            <div className="p-8 sm:p-12 pt-0 flex flex-wrap gap-4">
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center min-w-[200px]"
              >
                Register Now
              </a>
              <Link
                to={`/events/${event.slug}`}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                Visit Source <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={handleShare}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={cn(
                  "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2",
                  isBookmarked ? "text-emerald-500 border-emerald-500/20" : "text-zinc-900 dark:text-zinc-100"
                )}
              >
                <Bookmark className={cn("h-3.5 w-3.5", isBookmarked ? "fill-current" : "")} />
                {isBookmarked ? 'Saved' : 'Bookmark'}
              </button>
              <button
                onClick={handleSync}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-8 py-4 rounded-full text-xs font-black tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                {isSynced ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <GoogleIcon />}
                {isSynced ? 'Synced' : 'Add to Calendar'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

