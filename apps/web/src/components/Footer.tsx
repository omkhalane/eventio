import { Mail } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border border-t bg-black/90 py-12 text-sm text-stone-400">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-stone-50 to-stone-400 bg-clip-text text-xl font-black tracking-tighter text-transparent">
                Eventio
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-stone-500">
              EventIO aggregates hackathons, coding contests, tech events, and developer opportunities from platforms across the internet, curated for high-velocity builders.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a
                href="https://github.com/omkhalane/eventio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-400 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                title="GitHub Repository"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current transition-transform duration-300 hover:scale-110"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a
                href="mailto:support@event-io.me"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-400 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                title="Support Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-100 uppercase">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/calendar" className="transition-colors hover:text-emerald-400">
                  Calendar App
                </Link>
              </li>
              <li>
                <Link to="/submit" className="transition-colors hover:text-emerald-400">
                  Submit Event
                </Link>
              </li>
              <li>
                <Link to="/docs" className="transition-colors hover:text-emerald-400">
                  Developer Docs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest text-stone-100 uppercase">
              Legal & Meta
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="transition-colors hover:text-emerald-400">
                  About Eventio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-emerald-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-emerald-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors hover:text-emerald-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/opensource" className="transition-colors hover:text-emerald-400">
                  Contributors
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-stone-600">
            &copy; {currentYear} Eventio. Built by <a href="https://github.com/omkhalane" target="_blank" rel="noopener noreferrer" className="hover:text-stone-400 underline">Om Khalane</a>. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 text-xs text-stone-600 md:mt-0">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-stone-400">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
