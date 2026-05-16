import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Globe,
  Share2,
  Shield,
  Tag,
  Trophy,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { buildApiUrl } from '../lib/api';
import { cn } from '../lib/utils';
import { CalendarEvent } from '../types';
import { Footer } from './Footer';
import { SeoHead } from './SeoHead';

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) fetchEvent();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-primary h-12 w-12 rounded-full"
        />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <SeoHead title="Event Not Found | Eventio" description="The event you are looking for does not exist." />
        <h1 className="text-4xl font-black tracking-tighter">404</h1>
        <p className="text-muted-foreground mt-2">{error || 'Event not found'}</p>
        <Link to="/calendar" className="text-primary mt-6 font-bold hover:underline">
          Go to Calendar
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SeoHead 
        title={`${event.title} | Eventio`} 
        description={event.shortDescription || event.description || ''} 
        canonicalPath={`/events/${event.slug}`}
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(52,211,153,0.1),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[size:44px_44px]" />
        
        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <Link
            to="/calendar"
            className="text-muted-foreground hover:text-primary flex w-fit items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Calendar
          </Link>
          
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="bg-primary/20 text-primary rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase border border-primary/20">
              {event.platform}
            </span>
            <span className="bg-zinc-800 text-zinc-100 rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase border border-white/5">
              {event.event_type}
            </span>
          </div>
          
          <h1 className="mt-6 text-5xl leading-[0.95] font-black tracking-tighter md:text-8xl">
            {event.title}
          </h1>
          
          <p className="text-muted-foreground mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
            {event.shortDescription || event.description}
          </p>
          
          <div className="mt-12 flex flex-wrap gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Start Date</span>
              <div className="flex items-center gap-2 text-sm font-bold">
                <CalendarIcon className="text-primary h-4 w-4" />
                {format(startDate, 'EEEE, d MMMM yyyy')}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Start Time</span>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Clock className="text-primary h-4 w-4" />
                {format(startDate, 'HH:mm')} ({event.timezone || 'UTC'})
              </div>
            </div>
            {endDate && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">End Date</span>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CalendarIcon className="text-primary h-4 w-4" />
                  {format(endDate, 'EEEE, d MMMM yyyy')}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-14 flex flex-col gap-4 sm:flex-row">
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className="bg-primary text-primary-foreground flex items-center justify-center gap-3 rounded-full px-10 py-5 text-sm font-black tracking-widest uppercase shadow-2xl transition-transform hover:scale-[1.02] active:scale-95"
            >
              Go to Original Site
              <ExternalLink className="h-4 w-4" />
            </a>
            <button className="bg-white/5 text-white hover:bg-white/10 flex items-center justify-center gap-3 rounded-full border border-white/10 px-10 py-5 text-sm font-black tracking-widest uppercase backdrop-blur-md transition-all">
              <Share2 className="h-4 w-4" />
              Share Event
            </button>
          </div>
        </div>
      </div>
      
      {/* Details Section */}
      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-12 px-6 py-20 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase italic">About the event</h2>
            <div className="text-muted-foreground prose prose-invert max-w-none text-lg leading-relaxed">
              {event.description || "No detailed description available."}
            </div>
          </section>
          
          {event.tags && event.tags.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase italic">Tags & Categories</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="bg-zinc-900 text-zinc-300 rounded-lg border border-white/5 px-3 py-1 text-xs font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
        
        <aside className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase italic mb-6">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Platform</span>
                <span className="font-bold text-sm">{event.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Access</span>
                <span className="text-emerald-500 font-bold text-sm">{event.is_free ? 'Free' : 'Paid'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Status</span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase",
                  event.status === 'ongoing' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                )}>
                  {event.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
            <Trophy className="h-8 w-8 text-primary mb-4" />
            <h4 className="text-lg font-bold">Ready to participate?</h4>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              This event is indexed by Eventio. Click below to view the official details and registration.
            </p>
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className="bg-primary text-primary-foreground mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-black uppercase transition-opacity hover:opacity-90"
            >
              Visit Source <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </aside>
      </div>
      
      <Footer />
    </div>
  );
}
