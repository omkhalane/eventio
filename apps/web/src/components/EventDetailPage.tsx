import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Globe,
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
import { CalendarEvent } from '../types';
import { Footer } from './Footer';
import { SeoHead } from './SeoHead';
import ShareDialog from './ShareDialog';

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
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="bg-zinc-950 flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-zinc-500 font-black tracking-[0.5em] uppercase text-sm"
        >
          Loading Eventio
        </motion.div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-zinc-950 flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <SeoHead title="Event Not Found | Eventio" description="The event you are looking for does not exist." />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-8xl font-black tracking-tighter text-zinc-800 uppercase">404</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest">{error || 'Event not found'}</p>
          <Link 
            to="/calendar" 
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Calendar
          </Link>
        </motion.div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;

  return (
    <div className="bg-zinc-950 text-zinc-50 flex min-h-screen flex-col selection:bg-zinc-100 selection:text-zinc-900">
      <SeoHead 
        title={`${event.title} | Eventio`} 
        description={event.shortDescription || event.description || ''} 
        canonicalPath={`/events/${event.slug}`}
        image={`/api/og/event/${event.slug}`}
      />

      {/* Floating Top Nav */}
      <motion.nav 
        style={{ opacity: navOpacity, y: navTranslateY }}
        className="fixed top-6 inset-x-0 z-[100] mx-auto max-w-5xl px-6 pointer-events-none"
      >
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-4">
            <Link to="/calendar" className="text-zinc-400 hover:text-zinc-50 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-xs font-black tracking-widest uppercase truncate max-w-[200px]">
              {event.title}
            </span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsShareOpen(true)} className="text-zinc-400 hover:text-zinc-50 transition-colors">
               <Share2 className="h-4 w-4" />
             </button>
             <a 
               href={event.url} 
               target="_blank" 
               rel="noreferrer"
               className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
             >
               Register
             </a>
          </div>
        </div>
      </motion.nav>
      
      {/* Hero Section */}
      <div ref={heroRef} className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden pt-32 pb-20 px-6">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-full h-full bg-zinc-500/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-full h-full bg-zinc-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap gap-3"
            >
              <span className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {event.platform.toUpperCase()}
              </span>
              <span className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                {event.event_type.toUpperCase()}
              </span>
              {event.is_free && (
                <span className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  FREE ACCESS
                </span>
              )}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40"
            >
              {event.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed"
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
                className="bg-white text-black px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-[1.05] active:scale-95 transition-transform"
              >
                Register Now
              </a>
              <button 
                onClick={() => setIsShareOpen(true)}
                className="bg-zinc-900 border border-white/10 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:block relative"
          >
             <div className="absolute inset-0 bg-white/10 blur-[100px] rounded-full animate-pulse" />
             <div className="relative aspect-square w-full max-w-md mx-auto bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                {event.bannerImage ? (
                  <img src={event.bannerImage} className="absolute inset-0 w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-110" alt="" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Trophy className="w-64 h-64 text-white" />
                  </div>
                )}
                <div className="relative h-full flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <div className="bg-white text-black px-4 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
                        Eventio Premium
                      </div>
                      <Globe className="w-5 h-5 text-zinc-500" />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl font-black tracking-tighter leading-none uppercase">{event.title}</h3>
                      <div className="flex gap-4 text-zinc-500 text-[10px] font-black tracking-widest uppercase">
                        <span>{event.platform}</span>
                        <span>•</span>
                        <span>{format(startDate, 'MMM d, yyyy')}</span>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-y border-white/5">
        <div className="mx-auto max-w-6xl w-full px-6 py-6 flex flex-wrap items-center justify-between gap-8 text-[10px] font-black tracking-widest uppercase text-zinc-500">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-zinc-400" />
              <span>{format(startDate, 'EEEE, d MMMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>{format(startDate, 'HH:mm')} {event.timezone || 'UTC'}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <Shield className="w-4 h-4 text-zinc-400" />
               <span className="text-emerald-500">{event.is_free ? 'FREE ACCESS' : (event.price || 'PAID')}</span>
             </div>
             <div className="flex items-center gap-2">
               <Users className="w-4 h-4 text-zinc-400" />
               <span>{event.mode || 'ONLINE'}</span>
             </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mx-auto max-w-6xl w-full px-6 py-24 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-20">
        <div className="space-y-24">
          {/* About Section */}
          <section className="space-y-10">
            <h2 className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em] italic">About the event</h2>
            <div className="prose prose-zinc prose-invert max-w-none text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap selection:bg-white selection:text-black">
              {event.description || event.shortDescription || "No detailed description available."}
            </div>
          </section>

          {/* Timeline Section */}
          <section className="space-y-10">
            <h2 className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em] italic">Event Timeline</h2>
            <div className="space-y-0 relative pl-8 border-l border-white/10 ml-4">
               {[
                 { label: 'Event Start', date: startDate, desc: 'The event officially begins.' },
                 ...(endDate ? [{ label: 'Event End', date: endDate, desc: 'The event concludes.' }] : [])
               ].map((item, i) => (
                 <div key={i} className="relative pb-16 last:pb-0">
                    <div className="absolute -left-[41px] top-0 w-[17px] h-[17px] rounded-full bg-zinc-950 border-2 border-white flex items-center justify-center">
                       <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </div>
                    <div className="space-y-2">
                       <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{format(item.date, 'MMM d, HH:mm')}</span>
                       <h4 className="text-xl font-black uppercase tracking-tight">{item.label}</h4>
                       <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Prizes / Benefits */}
          {event.prizes && (
            <section className="space-y-10">
              <h2 className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em] italic">Prizes & Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 space-y-4 hover:border-white/20 transition-colors">
                    <Trophy className="w-10 h-10 text-zinc-100" />
                    <h4 className="text-2xl font-black uppercase tracking-tight">Main Rewards</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed whitespace-pre-wrap">{event.prizes}</p>
                 </div>
              </div>
            </section>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <section className="space-y-10">
              <h2 className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em] italic">Skills & Categories</h2>
              <div className="flex flex-wrap gap-3">
                {event.tags.map((tag) => (
                  <span key={tag} className="bg-zinc-900 border border-white/5 px-6 py-3 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-default">
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
             <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                <div className="space-y-2 text-center">
                   <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.4em]">Registration</span>
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic">Now Open</h3>
                </div>

                <div className="space-y-4">
                   <a 
                     href={event.url} 
                     target="_blank" 
                     rel="noreferrer"
                     className="w-full bg-white text-black py-6 rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-transform flex items-center justify-center gap-2"
                   >
                     Register Now <ExternalLink className="w-4 h-4" />
                   </a>
                   <button 
                     onClick={() => setIsShareOpen(true)}
                     className="w-full bg-zinc-800 text-white py-6 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                   >
                     <Share2 className="w-4 h-4" /> Share Event
                   </button>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                   <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Platform</span>
                      <span className="text-xs font-black uppercase">{event.platform}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Difficulty</span>
                      <span className="text-xs font-black uppercase">Intermediate</span>
                   </div>
                </div>
             </div>

             {event.organizerName && (
               <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-10 space-y-6">
                  <div className="flex items-center gap-4">
                     {event.organizerLogo ? (
                       <img src={event.organizerLogo} className="h-12 w-12 rounded-full border border-white/10 p-1" alt="" />
                     ) : (
                       <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                          <User className="h-6 w-6 text-zinc-500" />
                       </div>
                     )}
                     <div>
                        <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Organizer</p>
                        <h5 className="text-sm font-black uppercase tracking-tight">{event.organizerName}</h5>
                     </div>
                  </div>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Official event organized by {event.organizerName} and indexed on Eventio.
                  </p>
                  {event.organizerUrl && (
                    <a href={event.organizerUrl} target="_blank" rel="noreferrer" className="text-white text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                      Link to profile <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
               </div>
             )}
           </div>
        </aside>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-[100] p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5">
         <div className="flex gap-4">
            <a 
              href={event.url} 
              target="_blank" 
              rel="noreferrer"
              className="flex-[3] bg-white text-black py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-center shadow-xl"
            >
              Register Now
            </a>
            <button 
              onClick={() => setIsShareOpen(true)}
              className="flex-1 bg-zinc-900 border border-white/10 text-white p-4 rounded-full flex items-center justify-center"
            >
              <Share2 className="h-4 w-4" />
            </button>
         </div>
      </div>
      
      <Footer />

      <ShareDialog
        event={event}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}

