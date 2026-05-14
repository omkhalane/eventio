import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-black/90 border-t py-12 text-sm text-stone-400">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-stone-50 to-stone-400 bg-clip-text text-xl font-black tracking-tighter text-transparent">
                Eventio
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-stone-500">
              EventIO aggregates hackathons, coding contests, tech events, internships, and developer opportunities from platforms across the internet.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-100 uppercase">Product</h3>
            <ul className="space-y-3">
              <li><Link to="/events" className="hover:text-emerald-400 transition-colors">Events</Link></li>
              <li><Link to="/hackathons" className="hover:text-emerald-400 transition-colors">Hackathons</Link></li>
              <li><Link to="/contests" className="hover:text-emerald-400 transition-colors">Contests</Link></li>
              <li><Link to="/calendar" className="hover:text-emerald-400 transition-colors">Calendar</Link></li>
              <li><Link to="/api" className="hover:text-emerald-400 transition-colors">API</Link></li>
              <li><Link to="/docs" className="hover:text-emerald-400 transition-colors">Docs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-100 uppercase">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link></li>
              <li><Link to="/opensource" className="hover:text-emerald-400 transition-colors">Contributors</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-100 uppercase">Socials</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://github.com/omkhalane/eventio" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <Twitter className="h-4 w-4" /> Twitter/X
                </a>
              </li>
              <li>
                <a href="mailto:hello@event-io.me" className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                  <Mail className="h-4 w-4" /> Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-stone-600">
            &copy; {currentYear} Eventio. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 text-xs text-stone-600 md:mt-0">
            <Link to="/sitemap.xml" className="hover:text-stone-400">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
