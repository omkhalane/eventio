import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { auth, googleProvider } from '../lib/firebase';
import { cn } from '../lib/utils';

const LOGO_IMAGE = '/assets/logo.svg';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGoogleUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
      setIsProfileOpen(false);
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setGoogleUser(null);
      setIsProfileOpen(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleCategoriesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/' || location.pathname === '/landing') {
      const element = document.getElementById('coverage');
      if (element) {
        e.preventDefault();
        setIsOpen(false);
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { label: 'Explore Events', path: '/calendar' },
    { label: 'Categories', path: '/#coverage', onClick: handleCategoriesClick },
    { label: 'Submit Event', path: '/submit' },
    { label: 'Docs', path: '/docs' },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Left Wrapper: Logo + Links */}
        <div className="flex items-center gap-12">
          {/* Left: Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/[0.05] shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors group-hover:bg-white/10">
              <img
                src={LOGO_IMAGE}
                alt="Eventio Logo"
                className="h-6 w-6 rounded-md transition-transform group-hover:scale-110"
              />
            </span>
            <span className="bg-gradient-to-r from-stone-50 to-stone-400 bg-clip-text text-2xl font-black tracking-tighter text-transparent">
              Eventio
            </span>
          </Link>

          {/* Left Nav: Links */}
          <div className="hidden items-center gap-8 text-xs font-bold tracking-[0.2em] text-stone-400 uppercase lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={item.onClick}
                className={cn(
                  'transition-colors hover:text-emerald-400',
                  location.pathname === item.path && 'text-emerald-400'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Auth / CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          {/* Animated GitHub + Star Us Badge (Black & White Design) */}
          <a
            href="https://github.com/omkhalane/eventio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group border border-white/10 hover:border-white/30 rounded-full bg-white/5 hover:bg-white/10 px-3 py-1.5 transition-all text-stone-300 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span className="text-[9px] font-semibold text-stone-400 transition-colors group-hover:text-white uppercase tracking-wider">
              Star Us
            </span>
          </a>

          {googleUser ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 pr-3 text-xs font-bold text-stone-300 transition-colors hover:bg-white/[0.08]"
              >
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="truncate max-w-28">{googleUser.displayName || 'Developer'}</span>
                <ChevronDown className="h-3 w-3 opacity-55" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-stone-950 p-3 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="px-3 py-2 text-stone-400">
                        <p className="truncate text-xs font-bold text-stone-200">
                          {googleUser.displayName}
                        </p>
                        <p className="truncate text-[10px] opacity-70">
                          {googleUser.email}
                        </p>
                      </div>
                      <div className="my-2 h-px bg-white/10" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Circular Border linked to Firebase OAuth */
            <button
              onClick={handleGoogleSignIn}
              className="rounded-full border border-white/20 hover:border-emerald-400 hover:text-emerald-400 bg-transparent px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all mr-2 hover:bg-emerald-400/5 active:scale-95 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <Link
            to="/calendar"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-xs font-bold tracking-widest text-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-200 via-white to-cyan-200 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <span className="relative z-10 flex items-center gap-2">
              Launch{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-stone-300 transition-colors hover:bg-white/[0.08] lg:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-stone-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-5 px-6 py-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => {
                    if (item.onClick) item.onClick(e);
                    else setIsOpen(false);
                  }}
                  className="text-sm font-bold tracking-[0.2em] text-stone-300 uppercase transition-colors hover:text-emerald-400"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile GitHub link */}
              <a
                href="https://github.com/omkhalane/eventio"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 group w-fit border border-white/10 rounded-full bg-white/5 px-3 py-1.5 text-xs font-bold text-stone-300 transition-colors hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span className="text-[9px] font-semibold text-stone-400 transition-colors group-hover:text-white uppercase tracking-wider">
                  Star Us
                </span>
              </a>

              <div className="my-2 h-px bg-white/10" />

              <div className="flex items-center justify-between gap-4">
                {googleUser ? (
                  <div className="flex items-center gap-3">
                    {googleUser.photoURL ? (
                      <img
                        src={googleUser.photoURL}
                        alt=""
                        className="h-8 w-8 rounded-full border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-stone-200">
                        {googleUser.displayName}
                      </p>
                      <button
                        onClick={handleSignOut}
                        className="mt-0.5 text-[10px] font-bold text-rose-400 hover:underline"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="rounded-full border border-white/20 hover:border-emerald-400 hover:text-emerald-400 bg-transparent px-5 py-2 text-xs font-bold tracking-[0.2em] uppercase transition-all mr-2 hover:bg-emerald-400/5 active:scale-95 cursor-pointer"
                  >
                    Sign In
                  </button>
                )}

                <Link
                  to="/calendar"
                  onClick={() => setIsOpen(false)}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold tracking-widest text-black uppercase shadow-lg transition-transform active:scale-95"
                >
                  Launch <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
