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
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="bg-black/60 absolute inset-0 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-950 relative w-full max-w-lg overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]"
          >
            <div className="p-8 sm:p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase">Share Event</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest">Spread the word about this event</p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 rounded-full p-2 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Event Preview Mini-Card */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 flex gap-6 items-center">
                {event.thumbnailImage ? (
                  <img src={event.thumbnailImage} className="h-20 w-20 rounded-2xl object-cover shadow-lg" alt="" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                    <Share2 className="h-8 w-8 text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-zinc-900 dark:text-zinc-50 font-black tracking-tight text-lg truncate uppercase">{event.title}</h4>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{event.platform}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest">
                      {event.event_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-6">
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    copied ? "bg-emerald-500 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  )}>
                    {copied ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </button>

                {platforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 shadow-lg",
                      p.color
                    )}>
                      <p.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400 truncate w-full text-center">
                      {p.name.split(' ')[0]}
                    </span>
                  </a>
                ))}

                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <MoreHorizontal className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">More</span>
                </button>
              </div>

              {/* Dynamic URL Preview */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 to-zinc-500/5 rounded-2xl blur-xl group-hover:opacity-100 transition-opacity opacity-0" />
                <div className="relative bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-4 flex items-center justify-between gap-4 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-500 truncate">{shareUrl}</span>
                  <button onClick={handleCopyLink} className="text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors">
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
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
