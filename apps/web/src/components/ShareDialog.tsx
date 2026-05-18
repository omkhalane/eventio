import {
  Check,
  Copy,
  Globe,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';

import { cn } from '../lib/utils';
import { CalendarEvent } from '../types';

interface ShareDialogProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareDialog({ event, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/events/${event.slug}`;
  const shareTitle = `Check out ${event.title} on EventIO!`;

  const platforms = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
    },
    {
      name: 'X / Twitter',
      icon: Share2,
      color: 'bg-black',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Globe,
      color: 'bg-[#0077B5]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088CC]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: 'Facebook',
      icon: Globe,
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-zinc-500',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareTitle,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Native share failed:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-t-[2.5rem] border border-white/10 bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] sm:rounded-[2.5rem]"
          >
            <div className="space-y-8 p-8 sm:p-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">
                    Share Event
                  </h3>
                  <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    Spread the word about this event
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full bg-zinc-100 p-2 text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Event Preview Mini-Card */}
              <div className="flex items-center gap-6 rounded-3xl border border-zinc-100 bg-zinc-50 p-6">
                {event.thumbnailImage ? (
                  <img
                    src={event.thumbnailImage}
                    className="h-20 w-20 rounded-2xl object-cover shadow-lg"
                    alt=""
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-200">
                    <Share2 className="h-8 w-8 text-zinc-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-lg font-black tracking-tight text-zinc-900 uppercase">
                    {event.title}
                  </h4>
                  <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    {event.platform}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-[9px] font-black tracking-widest text-zinc-600 uppercase">
                      {event.event_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Grid */}
              <div className="grid grid-cols-4 gap-6 sm:grid-cols-4">
                <button onClick={handleCopyLink} className="group flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      'flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110',
                      copied ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-900',
                    )}
                  >
                    {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </button>

                {platforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center gap-3"
                  >
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-110',
                        p.color,
                      )}
                    >
                      <p.icon className="h-6 w-6" />
                    </div>
                    <span className="w-full truncate text-center text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                      {p.name.split(' ')[0]}
                    </span>
                  </a>
                ))}

                <button
                  onClick={handleNativeShare}
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 transition-all duration-300 group-hover:scale-110">
                    <MoreHorizontal className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                    More
                  </span>
                </button>
              </div>

              {/* Dynamic URL Preview */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-zinc-500/10 to-zinc-500/5 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-100 p-4">
                  <span className="truncate font-mono text-[10px] text-zinc-500">{shareUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="hover:text-primary text-zinc-900 transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
