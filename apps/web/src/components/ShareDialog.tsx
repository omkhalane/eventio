import {
  Check,
  Copy,
  Download,
  FileImage,
  FileJson,
  FileText,
  Mail,
  Send,
  Share2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';

import { exportEventAsImage } from '../lib/exportEvent';
import { cn } from '../lib/utils';
import { CalendarEvent } from '../types';

interface ShareDialogProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  captureSelector?: string;
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.004 3.936H5.03z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function ShareDialog({ event, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState<'pdf' | 'jpg' | 'ics' | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDownloadOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const shareUrl = `${window.location.origin}/events/${event.slug}`;
  const shareTitle = `Check out ${event.title} on EventIO!`;

  const platforms = [
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
    },
    {
      name: 'X',
      icon: XIcon,
      color: 'bg-black',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
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
      icon: FacebookIcon,
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

  const _handleNativeShare = async () => {
    if (navigator.share) {
      try {
        if (event.thumbnailImage) {
          try {
            const response = await fetch(event.thumbnailImage);
            const blob = await response.blob();
            const file = new File([blob], 'event-image.jpg', { type: blob.type });
            await navigator.share({
              title: event.title,
              text: shareTitle,
              url: shareUrl,
              files: [file],
            });
            return;
          } catch (e) {
            console.warn('Could not share image, falling back to text share', e);
          }
        }
        
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

  const handleExport = async (format: 'pdf' | 'jpg' | 'ics') => {
    try {
      setIsExporting(format);
      
      if (format === 'ics') {
        const { downloadIcsFile } = await import('../services/appleCalendarService');
        downloadIcsFile(event);
      } else {
        await exportEventAsImage(event, format);
      }
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-6"
        >
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

                <div className="relative flex flex-col items-center gap-3">
                  <button
                    onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 transition-all duration-300 hover:scale-110"
                  >
                    {isExporting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
                    ) : (
                      <Download className="h-6 w-6" />
                    )}
                  </button>
                  <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                    Download
                  </span>
                  
                  {/* Dropdown Menu Modal */}
                  <AnimatePresence>
                    {isDownloadOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40 bg-transparent"
                          onClick={() => setIsDownloadOpen(false)}
                        />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 z-50 mb-4 w-48 -translate-x-1/2"
                        >
                          <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2 bg-zinc-50/50">
                              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Download As</span>
                              <button onClick={() => setIsDownloadOpen(false)} className="rounded-full p-1 hover:bg-zinc-200 text-zinc-400 transition-colors">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => { handleExport('pdf'); setIsDownloadOpen(false); }}
                              className="flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                            >
                              <FileText className="h-4 w-4 text-rose-500" /> As PDF
                            </button>
                            <div className="h-px bg-zinc-100" />
                            <button
                              onClick={() => { handleExport('jpg'); setIsDownloadOpen(false); }}
                              className="flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                            >
                              <FileImage className="h-4 w-4 text-emerald-500" /> As JPG Image
                            </button>
                            <div className="h-px bg-zinc-100" />
                            <button
                              onClick={() => { handleExport('ics'); setIsDownloadOpen(false); }}
                              className="flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                            >
                              <FileJson className="h-4 w-4 text-blue-500" /> As ICS File
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
